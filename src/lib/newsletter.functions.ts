import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { newsletterEmailSchema, newsletterNameSchema } from "./newsletter-schema";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(data => z.object({ email: newsletterEmailSchema }).parse(data))
  .handler(async ({ data }) => {
    const { storeSubscription, syncPendingLeads } = await import("./newsletter.server");
    const receipt = await storeSubscription(data.email);
    const secret = process.env["LEADS_SYNC_SECRET"];
    if (secret) await syncPendingLeads(secret);
    return { receipt };
  });

export const saveNewsletterName = createServerFn({ method: "POST" })
  .inputValidator(data => z.object({ receipt: z.string().uuid(), name: newsletterNameSchema }).parse(data))
  .handler(async ({ data }) => {
    const { storeSubscriberName, syncPendingLeads } = await import("./newsletter.server");
    await storeSubscriberName(data.receipt, data.name);
    const secret = process.env["LEADS_SYNC_SECRET"];
    if (secret) await syncPendingLeads(secret);
    return { saved: true };
  });