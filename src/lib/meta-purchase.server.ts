import { createHash } from 'node:crypto';
import { purchaseEventId } from './payment-verification';
export const META_PIXEL_ID = '1117842984331501';
export const META_GRAPH_VERSION = 'v24.0';
export const hashIdentifier = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
export function purchasePayload(order: { id: string; amount: number; product_id: string; product_title: string; module_ids: string[]; email: string; phone: string | null; attribution: unknown }, approvedAt: string) {
  const attribution = order.attribution as { meta?: { consent?: { granted?: boolean; version?: string }; fbp?: string; fbc?: string; sourceUrl?: string; userAgent?: string } } | null;
  const m = attribution?.meta;
  if (m?.consent?.granted !== true || m.consent.version !== '1') return null;
  const eventTime = Math.floor(Date.parse(approvedAt) / 1000);
  if (!Number.isFinite(eventTime) || Date.now()/1000 - eventTime > 7*86400) return null;
  const ids = order.module_ids.length ? order.module_ids : [order.product_id];
  return { event_name: 'Purchase', event_time: eventTime, event_id: purchaseEventId(order.id), action_source: 'website', event_source_url: m.sourceUrl ?? 'https://educommerce.cl/checkout',
    user_data: { em: [hashIdentifier(order.email)], ...(order.phone ? { ph: [hashIdentifier(order.phone.replace(/\D/g, ''))] } : {}), ...(m.fbp ? { fbp: m.fbp } : {}), ...(m.fbc ? { fbc: m.fbc } : {}), ...(m.userAgent ? { client_user_agent: m.userAgent } : {}) },
    custom_data: { currency: 'CLP', value: order.amount, order_id: order.id, content_type: 'product', content_ids: ids, content_name: order.product_title, contents: ids.map(id => ({ id, quantity: 1 })), num_items: ids.length } };
}
export async function sendMetaEvent(event: Record<string, unknown>, testCode?: string) {
  const token = process.env['META_CAPI_ACCESS_TOKEN'];
  if (!token) return { ok: false, error: 'meta_not_configured' };
  try {
    const response = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event], ...(testCode ? { test_event_code: testCode } : {}) }), signal: AbortSignal.timeout(5000),
    });
    const result = await response.json() as { events_received?: number; fbtrace_id?: string; error?: { code?: number; error_subcode?: number } };
    return response.ok && result.events_received === 1 ? { ok: true, eventsReceived: 1, fbtraceId: result.fbtrace_id } : { ok: false, error: `meta_http_${response.status}_code_${result.error?.code ?? 0}_${result.error?.error_subcode ?? 0}` };
  } catch { return { ok: false, error: 'meta_transport_error' }; }
}
/** Explicitly synthetic: never reads or changes orders or the real conversion outbox. */
export async function sendIsolatedMetaTest() {
  const code = process.env['META_TEST_EVENT_CODE'];
  if (!code) return { ok: false, error: 'test_code_missing' };
  const eventId = `EDUCOMMERCE-META-TEST-${crypto.randomUUID()}`;
  const result = await sendMetaEvent({ event_name: 'Purchase', event_time: Math.floor(Date.now()/1000), event_id: eventId, action_source: 'website', event_source_url: 'https://educommerce.cl', user_data: { external_id: [hashIdentifier('educommerce-synthetic-test-not-a-customer')] }, custom_data: { currency: 'CLP', value: 1000, content_ids: ['EDUCOMMERCE-META-TEST-NOT-A-SALE'], content_type: 'product', content_name: 'Prueba ficticia Meta, no venta real' } }, code);
  return { ...result, eventId, value: 1000, currency: 'CLP', testEvent: true };
}
