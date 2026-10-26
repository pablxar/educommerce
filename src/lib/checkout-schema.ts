import { z } from "zod";

export const phoneSchema = z.string().trim().max(30)
  .refine(value => !value || /^[+\d\s().-]+$/.test(value), "Escribe un teléfono válido")
  .transform(value => value.replace(/[\s().-]/g, ""))
  .refine(value => !value || /^\+?\d{8,15}$/.test(value), "Incluye el código de país y un teléfono válido");
const attribution = z.record(z.string(), z.string().max(300)).optional();
export const checkoutContactSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre").max(100),
  email: z.string().trim().toLowerCase().email("Escribe un correo válido").max(255),
  phone: phoneSchema.default(""),
});
export const checkoutLeadSchema = checkoutContactSchema.extend({
  leadId: z.string().uuid(), productId: z.string().min(1).max(80),
  sessionId: z.string().uuid().optional(),
  attribution: z.object({ first: attribution, last: attribution }).optional(),
});
export const checkoutSchema = checkoutLeadSchema.extend({
  phone: phoneSchema.refine(value => value.length > 0, "Escribe tu teléfono con código de país"),
  meta: z.object({
    consent: z.object({ granted: z.boolean(), version: z.literal('1'), updatedAt: z.string().datetime() }),
    fbp: z.string().regex(/^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/).optional(),
    fbc: z.string().regex(/^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/).optional(),
    sourceUrl: z.string().url().max(500).refine(v => ['https://educommerce.cl','https://www.educommerce.cl'].includes(new URL(v).origin)),
  }).transform(m => m.consent.granted ? m : { consent: m.consent, sourceUrl: m.sourceUrl }).optional(),
});
export const activitySchema = z.object({
  id: z.string().uuid(), sessionId: z.string().uuid(),
  event: z.enum(["product_viewed", "cart_added", "upsell_selected", "checkout_viewed", "campus_opened", "whatsapp_opened"]),
  productId: z.string().max(80).optional(), path: z.string().startsWith("/").max(200),
  attribution: z.object({ first: attribution, last: attribution }).optional(),
});