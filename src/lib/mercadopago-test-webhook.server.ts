import { z } from "zod";

/** Fictitious Mercado Pago test application, test seller and test-only reference prefix. */
export const TEST_APPLICATION_ID = "3457752278222975";
export const TEST_COLLECTOR_ID = "3762626205";
export const TEST_REFERENCE_PREFIX = "EDUCOMMERCE-TEST-";
export const TEST_NOTIFICATION_URL = "https://project--cbdb585c-64a4-4dfa-9488-711143cd509f-dev.lovable.app/api/public/mercadopago/test-webhook";
const MAX_BODY_BYTES = 16384;
const MAX_AGE_MS = 15 * 60 * 1000;
const notificationSchema = z.object({
  type: z.literal("payment"),
  application_id: z.union([z.string(), z.number()]).transform(String).pipe(z.literal(TEST_APPLICATION_ID)).optional(),
  data: z.object({ id: z.union([z.string(), z.number()]).transform(String).pipe(z.string().regex(/^\d{1,20}$/)) }),
});

async function limitedBody(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_BODY_BYTES) { await reader.cancel(); return null; }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch { return null; }
  finally { reader.releaseLock(); }
}

function reply(status: number, result: string, receipt?: string) {
  return Response.json({ ok: status === 200, result, ...(receipt ? { receipt } : {}) }, {
    status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

type Diagnostic = {
  hmac: "valid" | "invalid" | "not_checked";
  application_id: string | null;
  event_type: string | null;
  test_seller: boolean | null;
  test_account: boolean | null;
  test_reference: boolean | null;
  preference_application: boolean | null;
  isolated_circuit: boolean | null;
  payment_status: string | null;
};

function safeToken(value: unknown, pattern: RegExp) {
  const text = typeof value === "string" || typeof value === "number" ? String(value) : "";
  return pattern.test(text) ? text : null;
}

/** Receipt-only sink: all provider reads use the test token; no database, campus or Meta dependencies. */
export async function receiveMercadoPagoTestWebhook(request: Request) {
  const diagnostic: Diagnostic = { hmac: "not_checked", application_id: null, event_type: null, test_seller: null, test_account: null, test_reference: null, preference_application: null, isolated_circuit: null, payment_status: null };
  const response = await evaluate(request, diagnostic);
  // Diagnostic only: never body, headers, payment IDs, references, signature, buyer data or tokens.
  console.info("mercadopago_test_webhook_diagnostic", { ...diagnostic, http_status: response.status, effects: "none" });
  return response;
}

async function evaluate(request: Request, diagnostic: Diagnostic) {
  const secret = process.env["MERCADOPAGO_TEST_WEBHOOK_SECRET"];
  const testToken = process.env["MERCADOPAGO_TEST_ACCESS_TOKEN"];
  if (!secret || !testToken) return reply(503, "test_receiver_not_configured");
  const url = new URL(request.url);
  diagnostic.event_type = safeToken(url.searchParams.get("type") ?? url.searchParams.get("topic"), /^[a-z_.]{1,40}$/);
  const idValues = url.searchParams.getAll("data.id");
  const id = idValues[0];
  const requestId = request.headers.get("x-request-id");
  const signature = request.headers.get("x-signature") ?? "";
  const parts = signature.split(",").map(part => part.trim().split("="));
  const timestamps = parts.filter(([key]) => key === "ts");
  const signatures = parts.filter(([key]) => key === "v1");
  const ts = timestamps[0]?.[1];
  const digest = signatures[0]?.[1];
  if (idValues.length !== 1 || !id || !/^\d{1,20}$/.test(id) ||
      !requestId || !/^[a-zA-Z0-9-]{1,100}$/.test(requestId) ||
      timestamps.length !== 1 || signatures.length !== 1 ||
      !ts || !/^\d{10,13}$/.test(ts) || !digest || !/^[a-fA-F0-9]{64}$/.test(digest)) {
    return reply(401, "invalid_webhook_authentication");
  }
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signatureBytes = Uint8Array.from(digest.match(/../g) ?? [], byte => parseInt(byte, 16));
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes,
      encoder.encode(`id:${id};request-id:${requestId};ts:${ts};`));
    diagnostic.hmac = valid ? "valid" : "invalid";
  } catch { return reply(503, "test_verification_unavailable"); }

  const raw = await limitedBody(request);
  let body: unknown = null;
  if (raw !== null) { try { body = JSON.parse(raw); } catch { body = null; } }
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    diagnostic.application_id = safeToken(b["application_id"], /^\d{1,20}$/);
    diagnostic.event_type = safeToken(b["type"] ?? b["topic"], /^[a-z_.]{1,40}$/) ?? diagnostic.event_type;
  }
  if (diagnostic.hmac !== "valid") return reply(401, "invalid_webhook_authentication");
  // Freshness applies to new deliveries; Mercado Pago re-signs resent notifications with a new ts.
  const time = Number(ts) * (ts.length === 10 ? 1000 : 1);
  if (Math.abs(Date.now() - time) > MAX_AGE_MS) return reply(401, "expired_test_notification");
  if (raw === null) return reply(413, "invalid_or_oversized_body");
  if (body === null) return reply(400, "invalid_test_notification");
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success || parsed.data.data.id !== id) return reply(400, "invalid_test_notification");

  // No provider lookup occurs before HMAC, freshness and notification validation pass.
  const readProvider = async (path: string): Promise<Record<string, unknown> | null> => {
    const res = await fetch(`https://api.mercadopago.com${path}`, {
      headers: { Authorization: `Bearer ${testToken}` }, signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
  };
  let payment: Record<string, unknown>;
  try {
    const found = await readProvider(`/v1/payments/${id}`);
    if (!found) return reply(502, "test_payment_not_verifiable");
    payment = found;
  } catch { return reply(502, "test_payment_not_verifiable"); }
  const collector = payment["collector_id"] ?? (payment["collector"] as Record<string, unknown> | undefined)?.["id"];
  const reference = payment["external_reference"];
  diagnostic.test_seller = String(collector ?? "") === TEST_COLLECTOR_ID;
  diagnostic.test_reference = typeof reference === "string" && reference.startsWith(TEST_REFERENCE_PREFIX);
  diagnostic.payment_status = safeToken(payment["status"], /^[a-z_]{1,30}$/);
  if (!diagnostic.test_seller || !diagnostic.test_reference) return reply(403, "not_a_test_payment");
  const metadata = payment["metadata"] as Record<string, unknown> | undefined;
  const order = payment["order"] as Record<string, unknown> | undefined;
  const orderId = safeToken(order?.["id"], /^\d{1,20}$/);
  if (String(payment["id"]) !== id || payment["currency_id"] !== "CLP" ||
      metadata?.["environment"] !== "isolated_test" || metadata?.["fulfillment"] !== "disabled" ||
      metadata?.["meta_conversion"] !== "disabled" || order?.["type"] !== "mercadopago" || !orderId) {
    diagnostic.isolated_circuit = false;
    return reply(403, "not_the_isolated_test_circuit");
  }
  // Confirm test-user status independently; live_mode is deliberately not an environment gate.
  try {
    const seller = await readProvider(`/users/${TEST_COLLECTOR_ID}`);
    if (!seller) return reply(502, "test_account_not_verifiable");
    diagnostic.test_account = String(seller["id"]) === TEST_COLLECTOR_ID &&
      Array.isArray(seller["tags"]) && seller["tags"].includes("test_user");
    if (!diagnostic.test_account) return reply(403, "seller_not_a_test_account");
    const merchantOrder = await readProvider(`/merchant_orders/${orderId}`);
    if (!merchantOrder) return reply(502, "test_preference_not_verifiable");
    const preferenceId = safeToken(merchantOrder["preference_id"], /^[a-zA-Z0-9-]{1,150}$/);
    const payments = merchantOrder["payments"];
    const linked = Array.isArray(payments) && payments.some(value =>
      value && typeof value === "object" && String(value.id) === id);
    if (String(merchantOrder["id"]) !== orderId || !linked || !preferenceId ||
        merchantOrder["external_reference"] !== reference ||
        String((merchantOrder["collector"] as Record<string, unknown> | undefined)?.["id"]) !== TEST_COLLECTOR_ID) {
      return reply(403, "invalid_test_payment_association");
    }
    const preference = await readProvider(`/checkout/preferences/${preferenceId}`);
    if (!preference) return reply(502, "test_preference_not_verifiable");
    diagnostic.preference_application = String(preference["client_id"]) === TEST_APPLICATION_ID;
    if (!diagnostic.preference_application) return reply(403, "not_the_test_application");
    diagnostic.isolated_circuit = preference["id"] === preferenceId &&
      String(preference["collector_id"]) === TEST_COLLECTOR_ID && preference["external_reference"] === reference &&
      preference["notification_url"] === TEST_NOTIFICATION_URL &&
      (preference["metadata"] as Record<string, unknown> | undefined)?.["environment"] === "isolated_test";
    if (!diagnostic.isolated_circuit) return reply(403, "not_the_isolated_test_circuit");
  } catch { return reply(502, "test_identity_not_verifiable"); }
  return reply(200, "signature_verified_test_received", crypto.randomUUID());
}
