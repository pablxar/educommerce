import { describe, expect, it } from "vitest";
import { checkoutContactSchema, checkoutSchema, phoneSchema } from "@/lib/checkout-schema";
import { campusPurchasePayload, type CampusPurchase } from "@/lib/purchase-tracking";

describe("Checkout contact tracking", () => {
  it("preserves and normalizes the telephone", () => {
    expect(phoneSchema.parse("+56 9 1234 5678")).toBe("+56912345678");
    expect(phoneSchema.safeParse("abc123").success).toBe(false);
  });
  it("captures name and email before the telephone is completed", () => {
    expect(checkoutContactSchema.parse({ name: " Ana ", email: "ANA@example.com" })).toEqual({ name: "Ana", email: "ana@example.com", phone: "" });
  });
  it("requires a phone before payment", () => {
    const input = { name: "Ana", email: "ana@example.com", productId: "educommerce-plus", leadId: "c51f6c33-1809-416e-96cd-3d82dc68fb63" };
    expect(checkoutSchema.safeParse(input).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...input, phone: "+56912345678" }).success).toBe(true);
  });
  it("forwards the telephone with the campus purchase", () => {
    const row: CampusPurchase = { id: "order", email: "ana@example.com", name: "Ana", phone: "+56912345678", product_id: "educommerce-plus", product_title: "Educommerce Plus", product_name: "Educommerce Plus", product_kind: "pack", module_ids: ["shopify"], amount: 199990, currency: "CLP", mp_payment_id: null, paid_at: null, attribution: {}, list_amount: 199990, discount_code: null, discount_percent: null, discount_amount: 0, mp_coupon_amount: null };
    expect(campusPurchasePayload(row).phone).toBe("+56912345678");
  });
});