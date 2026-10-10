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
