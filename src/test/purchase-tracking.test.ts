import { describe, expect, it } from "vitest";
import { getProduct } from "@/lib/products";
import { campusPurchasePayload, productTracking, reportedCouponAmount, type CampusPurchase } from "@/lib/purchase-tracking";

describe("Purchase promotion tracking", () => {
  it("records Shopify + Klaviyo 20% without discounting its price again", () => {
    const product = getProduct("combo-shopify-klaviyo");
    if (!product) throw new Error("Missing combo");
    expect(productTracking(product)).toEqual({ product_name: "Combo Lanza tu e-commerce con Shopify + Email marketing con Klaviyo", product_kind: "bundle", list_amount: 159980, discount_code: "COMBO20-SHOPIFY-KLAVIYO", discount_percent: 20, discount_amount: 32000 });
    expect(product.price).toBe(127980);
  });
  it("sends exact pack name without inventing a coupon", () => {
    const product = getProduct("pack-completo");
    if (!product) throw new Error("Missing pack");
    expect(productTracking(product).product_name).toBe("Pack Completo Educommerce");
    expect(productTracking(product).discount_code).toBeNull();
  });
  it("does not attach a bundle promotion to an individual module", () => {
    const product = getProduct("klaviyo");
    if (!product) throw new Error("Missing module");
    expect(productTracking(product).discount_amount).toBe(0);
    expect(productTracking(product).discount_code).toBeNull();
  });
  it("campus receives product name, code and purchased combination", () => {
    const row: CampusPurchase = { id: "order", email: "test@example.com", name: "Test", product_id: "combo-shopify-klaviyo", product_title: "Combo Shopify + Klaviyo", product_name: "Combo Shopify + Klaviyo", product_kind: "bundle", module_ids: ["shopify", "klaviyo"], amount: 127980, currency: "CLP", mp_payment_id: "payment", paid_at: null, attribution: {}, list_amount: 159980, discount_code: "COMBO20-SHOPIFY-KLAVIYO", discount_percent: 20, discount_amount: 32000, mp_coupon_amount: null };
    expect(campusPurchasePayload(row)).toMatchObject({ product_name: "Combo Shopify + Klaviyo", discount_code: "COMBO20-SHOPIFY-KLAVIYO", module_ids: ["shopify", "klaviyo"], amount: 127980, discount_percent: 20 });
    expect(campusPurchasePayload({ ...row, product_name: null }).product_name).toBe(row.product_title);
  });
  it("keeps missing or invalid provider coupon amounts unknown", () => {
    expect(reportedCouponAmount(undefined)).toBeNull();
    expect(reportedCouponAmount(-100)).toBeNull();
    expect(reportedCouponAmount(1000)).toBe(1000);
  });
});