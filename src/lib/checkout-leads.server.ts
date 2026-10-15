import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getProduct } from "@/lib/products";
import { productTracking } from "@/lib/purchase-tracking";

const CAMPUS_CHECKOUT_LEADS_URL = "https://app.educommerce.cl/api/public/checkout-leads";

type Stage = "datos" | "pago_iniciado" | "pagado";

/** Records name + email as soon as they're typed. Never downgrades a lead that already started payment. */
export async function recordCheckoutLead(input: { leadId: string; productId: string; email: string; name: string; attribution?: unknown }) {
  const product = getProduct(input.productId);
  if (!product) return { ok: false as const };
  const { data: existing } = await supabaseAdmin.from("checkout_leads").select("stage").eq("id", input.leadId).maybeSingle();
  if (existing && existing.stage !== "datos") return { ok: true as const };
  const row = {
    id: input.leadId, email: input.email, name: input.name, product_id: product.id,
    product_name: productTracking(product).product_name, amount: product.price,
    attribution: (input.attribution ?? {}) as never, stage: "datos",
    updated_at: new Date().toISOString(), synced_at: null, sync_revision: crypto.randomUUID(),
  };
  const { error } = existing
    ? await supabaseAdmin.from("checkout_leads").update(row).eq("id", input.leadId)
    : await supabaseAdmin.from("checkout_leads").insert(row);
  if (error) { console.error("checkout lead save failed", error.code); return { ok: false as const }; }
  await syncCheckoutLeads();
  return { ok: true as const };
}

export async function markCheckoutLeadStage(where: { leadId?: string; orderId: string }, stage: Stage) {
  const patch = { stage, order_id: where.orderId, updated_at: new Date().toISOString(), synced_at: null, sync_revision: crypto.randomUUID() };
  const q = supabaseAdmin.from("checkout_leads").update(patch);
  if (where.leadId) await q.eq("id", where.leadId).neq("stage", "pagado");
  else await q.eq("order_id", where.orderId);
}

/** Sends pending lead changes to the campus panel; rows stay pending until accepted. */
export async function syncCheckoutLeads() {
  const secret = process.env["LEADS_SYNC_SECRET"];
  if (!secret) return;
  const { data: rows } = await supabaseAdmin.from("checkout_leads")
    .select("id, email, name, product_id, product_name, amount, attribution, stage, order_id, created_at, updated_at, sync_revision")
    .is("synced_at", null).order("updated_at").limit(10);
  for (const row of rows ?? []) {
    try {
      const r = await fetch(CAMPUS_CHECKOUT_LEADS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: row.id, email: row.email, name: row.name, product_id: row.product_id, product_name: row.product_name,
          amount: row.amount, currency: "CLP", stage: row.stage, order_id: row.order_id, attribution: row.attribution,
          created_at: row.created_at, updated_at: row.updated_at,
        }),
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
      if (r.ok) await supabaseAdmin.from("checkout_leads").update({ synced_at: new Date().toISOString() }).eq("id", row.id).eq("sync_revision", row.sync_revision);
    } catch { /* keep pending */ }
  }
}
