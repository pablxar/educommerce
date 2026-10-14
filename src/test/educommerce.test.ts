import { describe, expect, it } from "vitest";
import { filterModules, externalUrl } from "@/lib/educommerce";

const ids = (c: Parameters<typeof filterModules>[0]) => filterModules(c).map(m => m.number);
describe("Homepage module filter rules", () => {
  it("Todos shows all 10 modules in order", () => { expect(ids("Todos")).toEqual([1,2,3,4,5,6,7,8,9,10]); });
  it("E-commerce shows Shopify and Klaviyo", () => { expect(ids("E-commerce")).toEqual([2,5]); });
  it("Ads shows Meta Ads and Google Ads", () => { expect(ids("Ads")).toEqual([3,4]); });
  it("Creatividad shows guiones, CapCut and gráficas", () => { expect(ids("Creatividad")).toEqual([6,7,8]); });
  it("Web shows Lovable", () => { expect(ids("Web")).toEqual([9]); });
  it("Negocio shows mentalidad and monetiza", () => { expect(ids("Negocio")).toEqual([1,10]); });
  it("External destinations reject unsafe protocols", () => { expect(externalUrl("javascript:alert(1)")).toBeUndefined(); expect(externalUrl("https://example.com/login")).toBe("https://example.com/login"); });
});

import { modules, formatPrice, moduleProgress, fullProgram } from "@/lib/educommerce";
import { getProduct, bundlePrice, isPurchasable, PACK_ID } from "@/lib/products";
describe("Full pack offer", () => {
  it("costs $297.000 CLP", () => { expect(fullProgram.price).toBe(297000); expect(formatPrice(297000)).toBe("$297.000"); });
  it("shows the $499.920 individual sum", () => { expect(fullProgram.originalPrice).toBe(499920); });
  it("individual sum matches sellable module prices", () => { expect(modules.reduce((t, m) => t + (m.price ?? 0), 0)).toBe(499920); });
  it("allows up to 6 installments", () => { expect(fullProgram.installments).toBe(6); });
  it("pack product is purchasable at 297000", () => { expect(getProduct(PACK_ID)?.price).toBe(297000); });
});
describe("Module prices CLP", () => {
  const price = (id: string) => modules.find(m => m.id === id)?.price;
  it("Meta Ads and Shopify cost 89990", () => { expect(price("meta")).toBe(89990); expect(price("shopify")).toBe(89990); });
  it("Google Ads costs 79990", () => { expect(price("google")).toBe(79990); });
  it("Guiones costs 39990", () => { expect(price("guiones")).toBe(39990); });
  it("Gráficas costs 29990", () => { expect(price("graficas")).toBe(29990); });
  it("Klaviyo costs 69990", () => { expect(price("klaviyo")).toBe(69990); });
  it("CapCut and Lovable cost 49990", () => { expect(price("capcut")).toBe(49990); expect(price("lovable")).toBe(49990); });
  it("Mentalidad cannot be bought alone", () => { expect(isPurchasable("mentalidad")).toBe(false); expect(getProduct("mentalidad")).toBeUndefined(); });
});
describe("Bundles", () => {
  it("Shopify + Klaviyo get 20% off", () => { expect(bundlePrice("shopify", "klaviyo")).toBe(Math.round((89990 + 69990) * 0.8 / 10) * 10); });
});
describe("Module progress", () => {
  it("2 of 4 capsules is 50%", () => { expect(moduleProgress("shopify", [1, 2])).toBe(50); });
  it("duplicates and unknown capsules don't count", () => { expect(moduleProgress("shopify", [1, 1, 9])).toBe(25); });
});
