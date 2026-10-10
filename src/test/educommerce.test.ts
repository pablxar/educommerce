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

import { modules, formatPrice, moduleProgress } from "@/lib/educommerce";
describe("Module prices", () => {
  const price = (id: string) => modules.find(m => m.id === id)!.price;
  it("Shopify costs 99 USD", () => { expect(price("shopify")).toBe(99); expect(formatPrice(99)).toBe("$99 USD"); });
  it("Meta Ads and Google Ads cost 79 USD", () => { expect(price("meta")).toBe(79); expect(price("google")).toBe(79); });
  it("Klaviyo costs 69 USD", () => { expect(price("klaviyo")).toBe(69); });
  it("Mentalidad and Gráficas cost 49 USD", () => { expect(price("mentalidad")).toBe(49); expect(price("graficas")).toBe(49); });
  it("Guiones, CapCut, Lovable and Monetiza cost 59 USD", () => { for (const id of ["guiones","capcut","lovable","monetiza"]) expect(price(id)).toBe(59); });
});
describe("Module progress", () => {
  it("2 of 4 capsules is 50%", () => { expect(moduleProgress("shopify", [1, 2])).toBe(50); });
  it("duplicates and unknown capsules don't count", () => { expect(moduleProgress("shopify", [1, 1, 9])).toBe(25); });
});
