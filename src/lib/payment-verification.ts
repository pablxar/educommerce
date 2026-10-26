import { z } from 'zod';
export const PRODUCTIVE_SELLER = '2642590837';
export const PRODUCTIVE_APPLICATION = '6428800267243215';
const identifier = z.union([z.string(), z.number()]).transform(String);
export const paymentSchema = z.object({
  id: identifier, status: z.string(), status_detail: z.string(), external_reference: z.string().nullable(),
  currency_id: z.string(), transaction_amount: z.number(), collector_id: identifier,
  date_approved: z.string().nullable(), transaction_amount_refunded: z.number().default(0),
  refunds: z.array(z.unknown()).default([]), order: z.object({ id: identifier, type: z.string() }).nullable(),
  metadata: z.record(z.unknown()).default({}),
});
export type ExpectedOrder = { id: string; amount: number; currency: string; mp_preference_id: string | null; product_id: string };
export type Payment = z.infer<typeof paymentSchema>;
export function verifyPayment(p: Payment, order: ExpectedOrder, now = Date.now()): string | null {
  if (p.status !== 'approved' || p.status_detail !== 'accredited') return 'not_accredited';
  if (p.external_reference !== order.id) return 'reference_mismatch';
  if (p.currency_id !== 'CLP' || order.currency !== 'CLP') return 'currency_mismatch';
  if (p.transaction_amount !== order.amount) return 'amount_mismatch';
  if (p.collector_id !== PRODUCTIVE_SELLER) return 'seller_mismatch';
  if (p.transaction_amount_refunded !== 0 || p.refunds.length) return 'refund_present';
  if (p.metadata['order_id'] !== order.id || p.metadata['product_id'] !== order.product_id || p.metadata['environment'] === 'isolated_test') return 'metadata_mismatch';
  if (!p.order || p.order.type !== 'mercadopago' || !order.mp_preference_id) return 'missing_preference_proof';
  const approved = Date.parse(p.date_approved ?? '');
  if (!Number.isFinite(approved) || approved > now + 60000) return 'invalid_approval_date';
  return null;
}
export function verifyAssociation(p: Payment, order: ExpectedOrder, merchant: Record<string, unknown>, preference: Record<string, unknown>): boolean {
  const payments = merchant['payments'];
  const collector = merchant['collector'] as Record<string, unknown> | undefined;
  const items = preference['items'];
  return String(merchant['id']) === p.order?.id && merchant['preference_id'] === order.mp_preference_id &&
    merchant['external_reference'] === order.id && String(collector?.['id']) === PRODUCTIVE_SELLER &&
    Array.isArray(payments) && payments.some(x => x && String(x.id) === p.id) &&
    preference['id'] === order.mp_preference_id && String(preference['client_id']) === PRODUCTIVE_APPLICATION &&
    String(preference['collector_id']) === PRODUCTIVE_SELLER && preference['external_reference'] === order.id &&
    Array.isArray(items) && items.length === 1 && items[0]?.id === order.product_id &&
    items[0]?.currency_id === 'CLP' && items[0]?.quantity === 1 && items[0]?.unit_price === order.amount;
}
export const purchaseEventId = (orderId: string) => `educommerce-purchase-${orderId}`;
