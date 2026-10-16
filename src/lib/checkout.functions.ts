import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const attr = z.record(z.string(), z.string().max(300)).optional();

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      productId: z.string().min(1).max(80),
      email: z.string().trim().toLowerCase().email().max(255),
      name: z.string().trim().min(1).max(100),
      attribution: z.object({ first: attr, last: attr }).optional(),
      leadId: z.string().uuid().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { startCheckout } = await import("./checkout.server");
    const { leadId, ...input } = data;
    return startCheckout({ ...input, ...(leadId ? { leadId } : {}) });
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { readOrderStatus } = await import("./checkout.server");
    return readOrderStatus(data.orderId);
  });

export const saveCheckoutLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      leadId: z.string().uuid(),
      productId: z.string().min(1).max(80),
      email: z.string().trim().toLowerCase().email().max(255),
      name: z.string().trim().min(1).max(100),
      attribution: z.object({ first: attr, last: attr }).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { recordCheckoutLead } = await import("./checkout-leads.server");
    return recordCheckoutLead(data);
  });
