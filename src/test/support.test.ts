import { describe, expect, it } from "vitest";
import { supportWhatsAppUrl } from "@/lib/support";

describe("support destination", () => {
  it("opens the owner's supplied WhatsApp number", () => {
    expect(supportWhatsAppUrl).toBe("https://wa.me/56974982741");
  });
});