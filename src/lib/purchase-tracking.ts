import { BUNDLE_DISCOUNT, type Product } from "@/lib/products";

export function productTracking(product: Product) {
  const discountAmount = product.listPrice - product.price;
  const percent = product.kind === "bundle" ? BUNDLE_DISCOUNT * 100 : null;
  return {
    product_name: product.title,
    product_kind: product.kind,
    list_amount: product.listPrice,
    discount_code: product.kind === "bundle" ? `COMBO${percent}-${product.moduleIds.join("-").toUpperCase()}` : null,
    discount_percent: percent,
    discount_amount: discountAmount,
  };
}

export type CampusPurchase = {
  id: string; email: string; name: string; product_id: string; product_title: string;
  product_name: string | null; product_kind: string | null; module_ids: string[];
  amount: number; currency: string; mp_payment_id: string | null; paid_at: string | null;
  attribution: unknown; list_amount: number | null; discount_code: string | null;
  discount_percent: number | null; discount_amount: number | null; mp_coupon_amount: number | null;
};

export function campusPurchasePayload(row: CampusPurchase) {
  return {
    order_id: row.id, email: row.email, name: row.name,
    product_id: row.product_id, product_name: row.product_name ?? row.product_title,
    product_kind: row.product_kind, module_ids: row.module_ids,
    amount: row.amount, currency: row.currency, payment_id: row.mp_payment_id,
    paid_at: row.paid_at, attribution: row.attribution,
    discount_code: row.discount_code, discount_percent: row.discount_percent,
    discount_amount: row.discount_amount, list_amount: row.list_amount,
    mp_coupon_amount: row.mp_coupon_amount,
  };
}

export function reportedCouponAmount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}