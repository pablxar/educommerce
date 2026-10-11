import { z } from "zod";

export const newsletterEmailSchema = z.string().trim().toLowerCase().email().max(255);
export const newsletterNameSchema = z.string().trim().min(1).max(100);
export const newsletterSource = "newsletter-footer";
export function leadPayload(email: string, name: string | null, source: string) {
  return { email, ...(name ? { name } : {}), source };
}