import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getProduct } from "@/lib/products";
import { productTracking } from "@/lib/purchase-tracking";

const CAMPUS_CHECKOUT_LEADS_URL = "https://app.educommerce.cl/api/public/checkout-leads";

type Stage = "datos" | "pago_iniciado" | "pagado";

/** Records name + email as soon as they're typed. Never downgrades a lead that already started payment. */
export async function recordCheckoutLead(input: { leadId: string; productId: string; email: string; name: string; phone: string; sessionId?: string; attribution?: unknown }) {
  const product = getProduct(input.productId);
  if (!product) return { ok: false as const };
  const { error } = await supabaseAdmin.rpc("save_checkout_contact", {
    p_id: input.leadId, p_email: input.email, p_name: input.name, p_phone: input.phone,
    p_product_id: product.id, p_product_name: productTracking(product).product_name,
    p_amount: product.price, p_attribution: (input.attribution ?? {}) as never,
    p_session_id: input.sessionId ?? input.leadId,
  });
  if (error) { console.error("checkout lead save failed", error.code); return { ok: false as const }; }
  await syncCheckoutLeads();
  return { ok: true as const };
}

export async function markCheckoutLeadStage(where: { leadId?: string; orderId: string }, stage: Stage) {
  const patch = { stage, order_id: where.orderId, updated_at: new Date().toISOString(), synced_at: null, sync_revision: crypto.randomUUID() };
  const q = supabaseAdmin.from("checkout_leads").update(patch);
  const { error } = where.leadId ? await q.eq("id", where.leadId).neq("stage", "pagado") : await q.eq("order_id", where.orderId);
  if (error) throw new Error("No pudimos registrar el estado del checkout.");
}

/** Sends pending lead changes to the campus panel; rows stay pending until accepted. */
export async function syncCheckoutLeads() {
  const secret = process.env["LEADS_SYNC_SECRET"];
  if (!secret) return;
  const { data: rows } = await supabaseAdmin.from("checkout_leads")
    .select("id, email, name, phone, session_id, product_id, product_name, amount, attribution, stage, order_id, created_at, updated_at, sync_revision")
    .is("synced_at", null).order("updated_at").limit(10);
  for (const row of rows ?? []) {
    try {
      const r = await fetch(CAMPUS_CHECKOUT_LEADS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: row.id, email: row.email, name: row.name, phone: row.phone, session_id: row.session_id, product_id: row.product_id, product_name: row.product_name,
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
