import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/campus-sync")({
  server: { handlers: { POST: async ({ request }) => {
    const failure = await authenticateCronRequest(request);
    if (failure) return failure;
    const { syncCheckoutLeads } = await import("@/lib/checkout-leads.server");
    const { syncPurchasesToCampus } = await import("@/lib/checkout.server");
    const { syncPendingLeads } = await import("@/lib/newsletter.server");
    const { syncSiteActivity } = await import("@/lib/site-activity.server");
    const secret = process.env["LEADS_SYNC_SECRET"];
    if (!secret) return new Response("Configuration unavailable", { status: 503 });
    await Promise.all([syncCheckoutLeads(), syncPurchasesToCampus(), syncPendingLeads(secret), syncSiteActivity()]);
    return Response.json({ ok: true });
  } } },
});