import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { paymentSchema, verifyPayment, verifyAssociation, PRODUCTIVE_SELLER, type ExpectedOrder } from './payment-verification';
import { purchasePayload, sendMetaEvent } from './meta-purchase.server';
async function provider(path: string): Promise<Record<string, unknown>> {
  const token = process.env['MERCADOPAGO_ACCESS_TOKEN'];
  if (!token) throw new Error('mp_not_configured');
  const response = await fetch(`https://api.mercadopago.com${path}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`mp_http_${response.status}`);
  return response.json();
}
/** Search is only discovery. Every candidate is re-fetched and linked to its authoritative preference. */
export async function inspectOrder(order: ExpectedOrder) {
  const search = await provider(`/v1/payments/search?external_reference=${encodeURIComponent(order.id)}&limit=10&sort=date_created&criteria=desc`);
  const paging = search['paging'] as { total?: number } | undefined;
  if ((paging?.total ?? 0) > 10) return { status: 'blocked', reason: 'too_many_candidates' };
  if (!Array.isArray(search['results'])) throw new Error('mp_invalid_search');
  const active = search['results'].filter(p => p.external_reference === order.id && ['approved','refunded','charged_back'].includes(p.status));
  if (!active.length) return { status: 'pending', reason: 'no_approved_payment' };
  if (active.length !== 1) return { status: 'blocked', reason: 'multiple_payments' };
  const candidate = active[0];
  const parsed = paymentSchema.safeParse(await provider(`/v1/payments/${encodeURIComponent(String(candidate.id))}`));
  if (!parsed.success) return { status: 'blocked', reason: 'invalid_payment_shape' };
  const p = parsed.data;
  if (p.status === 'refunded' || p.status === 'charged_back' || p.refunds.length || p.transaction_amount_refunded > 0) return { status: 'refunded', reason: 'refund_or_chargeback' };
  const invalid = verifyPayment(p, order);
  if (invalid) return { status: 'blocked', reason: invalid };
  const merchant = await provider(`/merchant_orders/${p.order?.id}`);
  const preference = await provider(`/checkout/preferences/${encodeURIComponent(order.mp_preference_id ?? '')}`);
  if (!verifyAssociation(p, order, merchant, preference)) return { status: 'blocked', reason: 'application_or_preference_mismatch' };
  const seller = await provider(`/users/${PRODUCTIVE_SELLER}`);
  if (String(seller['id']) !== PRODUCTIVE_SELLER || !Array.isArray(seller['tags']) || seller['tags'].includes('test_user')) return { status: 'blocked', reason: 'seller_not_productive' };
  return { status: 'verified', paymentId: p.id, approvedAt: p.date_approved, reason: null };
}
export async function reconcilePayments(orderId?: string, dryRun = false) {
  const results: { orderId: string; status: string; reason?: string | null }[] = [];
  if (dryRun) {
    let query = supabaseAdmin.from('orders').select('id,amount,currency,mp_preference_id,product_id').eq('status','pending').gte('created_at',new Date(Date.now()-30*86400000).toISOString()).limit(3);
    if (orderId) query = query.eq('id',orderId);
    const { data, error } = await query; if (error) throw new Error('measurement_read_failed');
    for (const order of data ?? []) { try { const result = await inspectOrder(order); results.push({orderId:order.id,status:result.status,reason:result.reason}); } catch(e) { results.push({orderId:order.id,status:'error',reason:e instanceof Error ? e.message : 'verification_error'}); } }
    return results;
  }
  const { data: claims, error: claimError } = await supabaseAdmin.rpc('claim_payment_measurements',orderId ? {requested_order:orderId} : {});
  if (claimError) throw new Error('measurement_claim_failed');
  for (const claim of claims ?? []) {
    try {
      const { data: order, error } = await supabaseAdmin.from('orders').select('id,amount,currency,mp_preference_id,product_id,product_title,module_ids,email,phone,attribution').eq('id',claim.order_id).single();
      if (error || !order) throw new Error('measurement_order_unavailable');
      const result = await inspectOrder(order);
      const { error: saveError } = await supabaseAdmin.from('payment_measurements').update({verification_status:result.status,last_error:result.reason,verified_payment_id:result.status==='verified' ? result.paymentId ?? null : claim.verified_payment_id,approved_at:result.status==='verified' ? result.approvedAt ?? null : claim.approved_at,updated_at:new Date().toISOString()}).eq('order_id',order.id);
      if (saveError) throw new Error('measurement_persist_failed');
      if (result.status === 'verified' && result.approvedAt) {
        const { data: settings } = await supabaseAdmin.from('measurement_settings').select('real_conversions_enabled').eq('id',true).maybeSingle();
        if (settings?.real_conversions_enabled && !claim.meta_sent_at && claim.meta_attempts<8 && Date.parse(claim.meta_next_at)<=Date.now()) {
          const event = purchasePayload(order,result.approvedAt);
          if (!event) await supabaseAdmin.from('payment_measurements').update({meta_status:'consent_or_age_blocked'}).eq('order_id',order.id);
          else {
            const sent = await sendMetaEvent(event);
            await supabaseAdmin.from('payment_measurements').update({meta_status:sent.ok?'sent':'retry',meta_sent_at:sent.ok?new Date().toISOString():null,meta_attempts:claim.meta_attempts+1,meta_next_at:new Date(Date.now()+Math.min(86400000,300000*2**claim.meta_attempts)).toISOString(),last_error:sent.ok?null:sent.error ?? 'meta_error'}).eq('order_id',order.id);
          }
        }
      }
      await supabaseAdmin.from('payment_measurements').update({lease_until:null}).eq('order_id',order.id);
      results.push({orderId:order.id,status:result.status,reason:result.reason});
    } catch(e) {
      const reason = e instanceof Error ? e.message : 'verification_error';
      await supabaseAdmin.from('payment_measurements').update({lease_until:null,last_error:reason,updated_at:new Date().toISOString(),next_check_at:new Date(Date.now()+Math.min(86400000,300000*2**Math.min(claim.attempts,8))).toISOString()}).eq('order_id',claim.order_id);
      console.error('payment_measurement_error',{reason}); results.push({orderId:claim.order_id,status:'error',reason});
    }
  }
  return results;
}
