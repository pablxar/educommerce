import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getProduct } from "@/lib/products";
import { fullProgram } from "@/lib/educommerce";

const MP = "https://api.mercadopago.com";
const CAMPUS_PURCHASES_URL = "https://app.educommerce.cl/api/public/purchases";

function siteOrigin() {
  const req = getRequest();
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

export async function startCheckout(input: { productId: string; email: string; name: string; attribution?: unknown }) {
  const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!token) return { ok: false as const, error: "El pago aún no está disponible. Escríbenos por WhatsApp." };
  const product = getProduct(input.productId);
  if (!product) return { ok: false as const, error: "Este producto no está disponible." };

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({ email: input.email, name: input.name, product_id: product.id, product_title: product.title, module_ids: product.moduleIds, amount: product.price, attribution: (input.attribution ?? {}) as never })
    .select("id")
    .single();
  if (error || !order) { console.error("order insert failed", error); return { ok: false as const, error: "No pudimos iniciar tu compra. Inténtalo de nuevo." }; }

  const origin = siteOrigin();
  const isPublic = origin.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(origin);
  const result = `${origin}/checkout/resultado?orden=${order.id}`;
  const res = await fetch(`${MP}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Idempotency-Key": order.id },
    body: JSON.stringify({
      items: [{ id: product.id, title: product.title, quantity: 1, unit_price: product.price, currency_id: "CLP", category_id: "learnings" }],
      payer: { email: input.email, name: input.name },
      external_reference: order.id,
      back_urls: { success: result, pending: result, failure: result },
      auto_return: isPublic ? "approved" : undefined,
      notification_url: isPublic ? `${origin}/api/public/mercadopago/webhook` : undefined,
      payment_methods: { installments: fullProgram.installments },
      statement_descriptor: "EDUCOMMERCE",
      metadata: { order_id: order.id, product_id: product.id },
    }),
  });
  if (!res.ok) {
    console.error(`Mercado Pago preference failed [${res.status}]: ${await res.text()}`);
    return { ok: false as const, error: "Mercado Pago no respondió. Inténtalo en unos minutos." };
  }
  const pref = (await res.json()) as { id: string; init_point: string };
  await supabaseAdmin.from("orders").update({ mp_preference_id: pref.id }).eq("id", order.id);
  return { ok: true as const, url: pref.init_point, orderId: order.id };
}

export async function readOrderStatus(orderId: string) {
  const { data } = await supabaseAdmin.from("orders").select("status, product_title, amount, product_id").eq("id", orderId).maybeSingle();
  return data ?? null;
}

/** Fetches the payment from Mercado Pago (authoritative) and updates the matching order. */
export async function handlePaymentNotification(paymentId: string) {
  const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!token) return;
  const res = await fetch(`${MP}/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) { console.error(`MP payment fetch failed [${res.status}]: ${await res.text()}`); return; }
  const p = (await res.json()) as { id: number; status: string; external_reference?: string; transaction_amount: number; currency_id: string };
  if (!p.external_reference) return;
  const { data: order } = await supabaseAdmin.from("orders").select("id, amount, status").eq("id", p.external_reference).maybeSingle();
  if (!order) return;
  const valid = p.currency_id === "CLP" && Math.round(p.transaction_amount) >= order.amount;
  const status = p.status === "approved" && !valid ? "amount_mismatch" : p.status;
  if (order.status === "approved" && status !== "refunded" && status !== "charged_back") return syncPurchasesToCampus();
  await supabaseAdmin.from("orders").update({ status, mp_payment_id: String(p.id), paid_at: status === "approved" ? new Date().toISOString() : null }).eq("id", order.id);
  await syncPurchasesToCampus();
}

/** Sends approved purchases to the campus so they attach to the student's account by email. */
export async function syncPurchasesToCampus() {
  const secret = process.env["LEADS_SYNC_SECRET"];
  if (!secret) return;
  const { data: rows } = await supabaseAdmin.from("orders").select("id, email, name, product_id, module_ids, amount, currency, mp_payment_id, paid_at, attribution").eq("status", "approved").is("campus_synced_at", null).limit(20);
  for (const row of rows ?? []) {
    try {
      const r = await fetch(CAMPUS_PURCHASES_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: row.id, email: row.email, name: row.name, product_id: row.product_id, module_ids: row.module_ids, amount: row.amount, currency: row.currency, payment_id: row.mp_payment_id, paid_at: row.paid_at, attribution: row.attribution }),
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) await supabaseAdmin.from("orders").update({ campus_synced_at: new Date().toISOString() }).eq("id", row.id);
      else console.error(`campus purchase sync failed [${r.status}]`);
    } catch (e) { console.error("campus purchase sync error", e); }
  }
}
