import { describe, expect, it } from "vitest";
import { leadPayload, newsletterEmailSchema, newsletterNameSchema } from "@/lib/newsletter-schema";

describe("Campus lead contract", () => {
  it("sends email, name and source as the campus requires", () => {
    expect(leadPayload("lead@example.com", "Ana", "newsletter-footer")).toEqual({ email: "lead@example.com", name: "Ana", source: "newsletter-footer" });
  });
  it("allows subscriptions without a name", () => {
    expect(leadPayload("lead@example.com", null, "newsletter-footer")).toEqual({ email: "lead@example.com", source: "newsletter-footer" });
  });
  it("normalizes the email for duplicate detection", () => {
    expect(newsletterEmailSchema.parse(" Ana@Example.com ")).toBe("ana@example.com");
    expect(newsletterEmailSchema.safeParse("not-an-email").success).toBe(false);
  });
  it("rejects empty or oversized names", () => {
    expect(newsletterNameSchema.safeParse(" ").success).toBe(false);
    expect(newsletterNameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });
});