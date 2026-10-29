import { describe, expect, it } from "vitest";
import { getProduct, plusPlans } from "@/lib/products";
import { productTracking, purchaseTerms, campusPurchasePayload, type CampusPurchase } from "@/lib/purchase-tracking";

describe("Educommerce Plus commercial rules", () => {
  it("annual launch plan is 169990 for one year without advisory or VIP", () => {
    const p = getProduct("educommerce-plus");
    expect(p?.price).toBe(169990); expect(p?.access).toBe("one_year"); expect(p?.benefits).toHaveLength(3);
  });
  it("launch price is struck against the 249990 normal price", () => {
    const p = getProduct("educommerce-plus"); if (!p) throw new Error("Missing Plus");
    expect(p.listPrice).toBe(249990); expect(productTracking(p).discount_amount).toBe(80000);
  });
  it("lifetime adds exactly 20000 for a 189990 total", () => {
    const p = getProduct("educommerce-plus-vitalicio");
    expect(p?.price).toBe(189990); expect((p?.price ?? 0) - plusPlans[0].price).toBe(20000); expect(p?.access).toBe("lifetime");
  });
  it("269990 includes lifetime, one advisory call and WhatsApp", () => {
    const p = getProduct("educommerce-plus-asesoria");
    expect(p?.price).toBe(269990); expect(p?.access).toBe("lifetime"); expect(p?.benefits).toEqual([...plusPlans[1].benefits, "1 asesoría por llamada", "Grupo WhatsApp para dudas pequeñas"]);
  });
  it("349990 cumulatively adds weekly group class for one month and VIP", () => {
    const p = getProduct("educommerce-plus-vip");
    expect(p?.price).toBe(349990); expect(p?.access).toBe("lifetime"); expect(p?.benefits).toEqual([...plusPlans[2].benefits, "1 clase grupal semanal durante 1 mes", "Grupo VIP"]);
  });
  it("each plan grants all 9 modules and the pack-only module, without removed module 10", () => {
    for (const plan of plusPlans) { const p = getProduct(plan.id); expect(p?.moduleIds).toHaveLength(9); expect(p?.moduleIds).toContain("mentalidad"); expect(p?.moduleIds).not.toContain("monetiza"); }
  });
  it("sends immutable paid access terms to the campus rather than resolving current prices", () => {
    const p = getProduct("educommerce-plus-vip"); if (!p) throw new Error("Missing Plus");
    const terms = purchaseTerms(p);
    const row: CampusPurchase = { id: "order", email: "buyer@example.com", name: "Buyer", product_id: p.id, product_title: p.title, product_name: p.title, product_kind: "pack", module_ids: p.moduleIds, amount: p.price, currency: "CLP", mp_payment_id: null, paid_at: null, attribution: { utm_source: "meta", purchase_terms: terms }, list_amount: p.price, discount_code: null, discount_percent: null, discount_amount: 0, mp_coupon_amount: null };
    expect(campusPurchasePayload(row)).toMatchObject({ product_id: "educommerce-plus-vip", amount: 349990, purchase_terms: { access: "lifetime", amount: 349990, benefits: [...plusPlans[3].benefits] } });
  });
});