import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { receiveMercadoPagoTestWebhook, TEST_NOTIFICATION_URL } from "@/lib/mercadopago-test-webhook.server";

const secret = "synthetic-unit-test-key-not-a-project-credential";
const id = "123456";
async function notification(body: Record<string, unknown> = {}, options: { badSignature?: boolean; age?: number; bodyId?: string } = {}) {
  const ts = String(Math.floor((Date.now() - (options.age ?? 0)) / 1000));
  const encoder = new TextEncoder();
  const key = await webcrypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = await webcrypto.subtle.sign("HMAC", key, encoder.encode(`id:${id};request-id:test-request;ts:${ts};`));
  const digest = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
  return new Request(`https://example.test/api/public/mercadopago/test-webhook?data.id=${id}`, {
    method: "POST", headers: { "x-request-id": "test-request", "x-signature": `ts=${ts},v1=${options.badSignature ? "0".repeat(64) : digest}` },
    body: JSON.stringify({ type: "payment", live_mode: false, application_id: "3457752278222975", data: { id: options.bodyId ?? id }, ...body }),
  });
}

describe("Isolated Mercado Pago test receiver", () => {
  beforeEach(() => { vi.stubGlobal("crypto", webcrypto); vi.stubEnv("MERCADOPAGO_TEST_WEBHOOK_SECRET", secret); vi.stubEnv("MERCADOPAGO_TEST_ACCESS_TOKEN", "synthetic-token"); });
  const payment = (p: Record<string, unknown> = {}, overrides: { seller?: Record<string, unknown>; order?: Record<string, unknown>; preference?: Record<string, unknown>; missingPreference?: boolean } = {}) => vi.fn(async (url: string) => {
    if (url.includes('/v1/payments/')) return Response.json({ id, collector_id: 3762626205, external_reference: "EDUCOMMERCE-TEST-abc", status: "approved", currency_id: "CLP", order: { id: "987", type: "mercadopago" }, metadata: { environment: "isolated_test", fulfillment: "disabled", meta_conversion: "disabled" }, ...p });
    if (url.includes('/users/')) return Response.json({ id: 3762626205, tags: ["test_user"], ...overrides.seller });
    if (url.includes('/merchant_orders/')) return Response.json({ id: 987, preference_id: "test-pref", collector: { id: 3762626205 }, external_reference: "EDUCOMMERCE-TEST-abc", payments: [{ id }], ...overrides.order });
    if (url.includes('/checkout/preferences/')) return overrides.missingPreference ? new Response(null, { status: 404 }) : Response.json({ id: "test-pref", client_id: "3457752278222975", collector_id: 3762626205, external_reference: "EDUCOMMERCE-TEST-abc", notification_url: TEST_NOTIFICATION_URL, metadata: { environment: "isolated_test" }, ...overrides.preference });
    throw new Error("Unexpected provider lookup");
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("accepts a signed test-app notification whose payment belongs to the test seller and reference", async () => {
    const fetch = payment(); vi.stubGlobal("fetch", fetch);
    const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const response = await receiveMercadoPagoTestWebhook(await notification({ live_mode: true, email: "not-for-logs@example.test" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Receiver-Version")).toBe("test-webhook-v3-optional-app-id");
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(log.mock.calls).toEqual([["mercadopago_test_webhook_diagnostic", { hmac: "valid", application_id: "3457752278222975", event_type: "payment", test_seller: true, test_account: true, test_reference: true, preference_application: true, isolated_circuit: true, payment_status: "approved", http_status: 200, effects: "none" }]]);
  });
  it("rejects a signed notification for a payment of the real seller", async () => {
    vi.stubGlobal("fetch", payment({ collector_id: 1111 })); vi.spyOn(console, "info").mockImplementation(() => undefined);
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("rejects a signed notification without the test reference prefix", async () => {
    vi.stubGlobal("fetch", payment({ external_reference: "real-order-uuid" })); vi.spyOn(console, "info").mockImplementation(() => undefined);
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("rejects the production application before any lookup", async () => {
    const fetch = payment(); vi.stubGlobal("fetch", fetch); vi.spyOn(console, "info").mockImplementation(() => undefined);
    expect((await receiveMercadoPagoTestWebhook(await notification({ application_id: "6428800267243215" }))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("reports an invalid HMAC and rejects it", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
    expect((await receiveMercadoPagoTestWebhook(await notification({}, { badSignature: true }))).status).toBe(401);
    expect(log.mock.calls[0]?.[1]).toMatchObject({ hmac: "invalid", http_status: 401 });
  });
  it("rejects a forged signature without any lookup", async () => {
    const fetch = payment(); vi.stubGlobal("fetch", fetch);
    expect((await receiveMercadoPagoTestWebhook(await notification({}, { badSignature: true }))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects expired replays", async () => {
    expect((await receiveMercadoPagoTestWebhook(await notification({}, { age: 16 * 60 * 1000 }))).status).toBe(401);
  });
  it("rejects unsigned legacy IPN", async () => {
    expect((await receiveMercadoPagoTestWebhook(new Request("https://example.test/?topic=payment&id=123456", { method: "POST" }))).status).toBe(401);
  });
  it("rejects a body payment ID different from the signed query ID", async () => {
    expect((await receiveMercadoPagoTestWebhook(await notification({}, { bodyId: "987654" }))).status).toBe(400);
  });
  it("fails closed when its separate signing secret is missing", async () => {
    vi.stubEnv("MERCADOPAGO_TEST_WEBHOOK_SECRET", "");
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(503);
  });
  it("rejects oversized bodies", async () => {
    expect((await receiveMercadoPagoTestWebhook(await notification({ extra: "x".repeat(17000) }))).status).toBe(413);
  });
  it("accepts payment.created without body application_id after authoritative preference verification", async () => {
    vi.stubGlobal("fetch", payment());
    expect((await receiveMercadoPagoTestWebhook(await notification({ application_id: undefined, action: "payment.created" }))).status).toBe(200);
  });
  it("rejects a preference belonging to another application even when the body claims the test application", async () => {
    vi.stubGlobal("fetch", payment({}, { preference: { client_id: "6428800267243215" } }));
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("rejects missing body application_id when preference application cannot be verified", async () => {
    vi.stubGlobal("fetch", payment({}, { preference: { client_id: null } }));
    expect((await receiveMercadoPagoTestWebhook(await notification({ application_id: undefined }))).status).toBe(403);
  });
  it("rejects unavailable preference proof", async () => {
    vi.stubGlobal("fetch", payment({}, { missingPreference: true }));
    expect((await receiveMercadoPagoTestWebhook(await notification({ application_id: undefined }))).status).toBe(502);
  });
  it("requires Mercado Pago test_user confirmation for seller 3762626205", async () => {
    vi.stubGlobal("fetch", payment({}, { seller: { tags: ["normal"] } }));
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("requires the merchant order to include the authenticated payment", async () => {
    vi.stubGlobal("fetch", payment({}, { order: { payments: [{ id: "111" }] } }));
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("requires disabled campus fulfillment and Meta conversion in the isolated payment", async () => {
    vi.stubGlobal("fetch", payment({ metadata: { environment: "isolated_test", fulfillment: "enabled", meta_conversion: "disabled" } }));
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("rejects a preference pointing at the production webhook", async () => {
    vi.stubGlobal("fetch", payment({}, { preference: { notification_url: "https://educommerce.cl/api/public/mercadopago/webhook" } }));
    expect((await receiveMercadoPagoTestWebhook(await notification())).status).toBe(403);
  });
  it("accepts a freshly signed resend of an old payment without using its creation date", async () => {
    vi.stubGlobal("fetch", payment({ date_created: "2020-01-01T00:00:00Z" }));
    expect((await receiveMercadoPagoTestWebhook(await notification({ date_created: "2020-01-01T00:00:00Z", application_id: undefined }))).status).toBe(200);
  });
  it("rejects an expired signature even when the payment creation date is current", async () => {
    const fetch = payment(); vi.stubGlobal("fetch", fetch);
    expect((await receiveMercadoPagoTestWebhook(await notification({ date_created: new Date().toISOString() }, { age: 16 * 60 * 1000 }))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
});