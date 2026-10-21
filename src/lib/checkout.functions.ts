import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkoutLeadSchema, checkoutSchema } from "./checkout-schema";

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const { startCheckout } = await import("./checkout.server");
    return startCheckout(data);
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { readOrderStatus } = await import("./checkout.server");
    return readOrderStatus(data.orderId);
  });

export const saveCheckoutLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutLeadSchema.parse(input))
  .handler(async ({ data }) => {
    const { recordCheckoutLead } = await import("./checkout-leads.server");
    return recordCheckoutLead(data);
  });
