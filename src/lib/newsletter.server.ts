import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { leadPayload, newsletterSource } from "./newsletter-schema";

const campusEndpoint = "https://app.educommerce.cl/api/public/leads";

// Pending rows stay durable when the campus is unavailable. Subsequent
// subscriptions retry a bounded batch; no provider response or PII is logged.
export async function syncPendingLeads(secret: string) {
  const { data: rows } = await supabaseAdmin.from("newsletter_subscribers")
    .select("id,email,name,source,sync_revision").is("synced_at", null)
    .order("created_at").limit(5);
  for (const row of rows ?? []) {
    try {
      const response = await fetch(campusEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify(leadPayload(row.email, row.name, row.source)),
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
      if (!response.ok) continue;
      await supabaseAdmin.from("newsletter_subscribers")
        .update({ synced_at: new Date().toISOString() })
        .eq("id", row.id).eq("sync_revision", row.sync_revision);
    } catch {
      // Keep the row pending; an external outage must not lose a subscription.
    }
  }
}

export async function storeSubscription(email: string) {
  const { error } = await supabaseAdmin.from("newsletter_subscribers")
    .upsert({ email, source: newsletterSource }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw new Error("No se pudo guardar la suscripción.");
  const { data: subscriber } = await supabaseAdmin.from("newsletter_subscribers")
    .select("id").eq("email", email).single();
  if (!subscriber) throw new Error("No se pudo guardar la suscripción.");
  const { data: receipt } = await supabaseAdmin.from("newsletter_name_receipts")
    .insert({ subscriber_id: subscriber.id }).select("token").single();
  if (!receipt) throw new Error("No se pudo completar la suscripción.");
  return receipt.token;
}

export async function storeSubscriberName(receipt: string, name: string) {
  const { data: access } = await supabaseAdmin.from("newsletter_name_receipts")
    .select("subscriber_id,created_at").eq("token", receipt).single();
  if (!access || Date.now() - Date.parse(access.created_at) > 60 * 60 * 1000) {
    throw new Error("Vuelve a suscribirte para añadir tu nombre.");
  }
  const { error } = await supabaseAdmin.from("newsletter_subscribers")
    .update({ name, synced_at: null, sync_revision: crypto.randomUUID() })
    .eq("id", access.subscriber_id);
  if (error) throw new Error("No se pudo guardar el nombre.");
  await supabaseAdmin.from("newsletter_name_receipts").delete().eq("token", receipt);
}