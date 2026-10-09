import { describe, expect, it } from "vitest";
import { filterCourses, externalUrl } from "@/lib/educommerce";

describe("Homepage category rules", () => {
  it("Todos shows all four courses", () => { expect(filterCourses("Todos").map(c => c.id)).toEqual(["shopify", "meta", "klaviyo", "contenido"]); });
  it("E-commerce shows only Shopify", () => { expect(filterCourses("E-commerce").map(c => c.title)).toEqual(["E-commerce con Shopify"]); });
  it("Marketing shows Meta Ads and Klaviyo", () => { expect(filterCourses("Marketing").map(c => c.title)).toEqual(["Publicidad con Meta Ads", "Email marketing con Klaviyo"]); });
  it("Contenido shows only Contenido que conecta", () => { expect(filterCourses("Contenido").map(c => c.title)).toEqual(["Contenido que conecta"]); });
  it("External destinations reject unsafe protocols", () => { expect(externalUrl("javascript:alert(1)")).toBeUndefined(); expect(externalUrl("https://example.com/login")).toBe("https://example.com/login"); });
});