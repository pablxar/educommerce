import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { receiveMercadoPagoTestWebhook } from "@/lib/mercadopago-test-webhook.server";

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
  const payment = (p: Record<string, unknown> = {}) => vi.fn(async () => Response.json({ collector_id: 3762626205, external_reference: "EDUCOMMERCE-TEST-abc", status: "approved", ...p }));
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("accepts a signed test-app notification whose payment belongs to the test seller and reference", async () => {
    const fetch = payment(); vi.stubGlobal("fetch", fetch);
    const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const response = await receiveMercadoPagoTestWebhook(await notification({ live_mode: true, email: "not-for-logs@example.test" }));
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(log.mock.calls).toEqual([["mercadopago_test_webhook_diagnostic", { hmac: "valid", application_id: "3457752278222975", event_type: "payment", test_seller: true, test_reference: true, payment_status: "approved", http_status: 200, effects: "none" }]]);
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
});