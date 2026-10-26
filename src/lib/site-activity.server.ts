import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getProduct } from "./products";
import { productTracking } from "./purchase-tracking";
import type { z } from "zod";
import type { activitySchema } from "./checkout-schema";

export async function storeSiteActivity(input: z.infer<typeof activitySchema>) {
  const { count, error: countError } = await supabaseAdmin.from("site_activity")
    .select("id", { count: "exact", head: true }).eq("session_id", input.sessionId)
    .gte("created_at", new Date(Date.now() - 3600000).toISOString());
  if (countError) throw new Error("No pudimos registrar la actividad.");
  if ((count ?? 0) >= 100) return { ok: false };
  const product = input.productId ? getProduct(input.productId) : undefined;
  if (input.productId && !product) return { ok: false };
  const { error } = await supabaseAdmin.from("site_activity").upsert({
    id: input.id, source_id: input.id, session_id: input.sessionId, event_type: input.event,
    payload: { path: input.path, attribution: input.attribution ?? {},
      ...(product ? { product_id: product.id, module_ids: product.moduleIds, amount: product.price, ...productTracking(product) } : {}) },
  }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw new Error("No pudimos registrar la actividad.");
  await syncSiteActivity(input.id).catch(() => console.warn('[activity-sync] pending event retained'));
  return { ok: true };
}

/** Immutable IDs let the campus deduplicate deliveries. Failed events remain local. */
export async function syncSiteActivity(eventId?: string) {
  const secret = process.env["LEADS_SYNC_SECRET"];
  if (!secret) return;
  let query = supabaseAdmin.from("site_activity").select("*").is("synced_at", null);
  query = eventId ? query.eq("id", eventId) : query.lte("next_attempt_at", new Date().toISOString());
  const { data: rows, error } = await query.order("created_at").limit(5);
  if (error) throw new Error("No pudimos consultar la actividad pendiente.");
  for (const row of rows ?? []) {
    let status = 0;
    try {
      const response = await fetch("https://app.educommerce.cl/api/public/activity", {
        method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json", "Idempotency-Key": row.id },
        body: JSON.stringify({ event_id: row.id, session_id: row.session_id, event_type: row.event_type,
          source_id: row.source_id, created_at: row.created_at, payload: row.payload }),
        signal: AbortSignal.timeout(8000), redirect: "manual",
      });
      status = response.status;
      if (!response.ok) console.warn(`[activity-sync] campus rejected event: HTTP ${status}`);
      if (response.ok) {
        await supabaseAdmin.from("site_activity").update({ synced_at: new Date().toISOString(), last_status: status }).eq("id", row.id);
        continue;
      }
    } catch (e) { console.warn("[activity-sync] transport error", e instanceof Error ? e.name + ": " + e.message : "unknown"); }
    await supabaseAdmin.from("site_activity").update({ attempts: row.attempts + 1, last_status: status || null,
      next_attempt_at: new Date(Date.now() + Math.min(86400000, 60000 * 2 ** Math.min(row.attempts, 10))).toISOString(),
    }).eq("id", row.id).eq("attempts", row.attempts);
  }
}