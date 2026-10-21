import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), fetch: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: mocks.from } }));
import { storeSiteActivity, syncSiteActivity } from "@/lib/site-activity.server";

function query(result: unknown) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ["select", "eq", "gte", "is", "lte", "order", "limit", "update", "upsert"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = vi.fn((resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve));
  return builder;
}

describe("Immediate campus activity delivery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("LEADS_SYNC_SECRET", "test-only-secret");
    vi.stubGlobal("fetch", mocks.fetch);
  });
  const row = { id: "event-1", session_id: "session-1", event_type: "cart_added", source_id: "event-1", created_at: "2026-10-21T23:00:00Z", payload: {}, attempts: 0 };

  it("sends a newly stored event immediately using its original ID", async () => {
    const selected = query({ data: [row], error: null });
    mocks.from.mockReturnValueOnce(query({ count: 0, error: null }))
      .mockReturnValueOnce(query({ error: null })).mockReturnValueOnce(selected)
      .mockReturnValueOnce(query({ error: null }));
    mocks.fetch.mockResolvedValue({ ok: true, status: 200 });
    await storeSiteActivity({ id: row.id, sessionId: row.session_id, event: "cart_added", path: "/checkout" });
    expect(selected.eq).toHaveBeenCalledWith("id", "event-1");
    expect(mocks.fetch).toHaveBeenCalledWith("https://app.educommerce.cl/api/public/activity", expect.objectContaining({
      headers: expect.objectContaining({ "Idempotency-Key": "event-1" }),
      body: JSON.stringify({ event_id: row.id, session_id: row.session_id, event_type: row.event_type, source_id: row.source_id, created_at: row.created_at, payload: {} }),
    }));
  });

  it("retains rejected events for a later retry without marking them delivered", async () => {
    const updated = query({ error: null });
    mocks.from.mockReturnValueOnce(query({ data: [row], error: null })).mockReturnValueOnce(updated);
    mocks.fetch.mockResolvedValue({ ok: false, status: 401 });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await syncSiteActivity(row.id);
    expect(updated.update).toHaveBeenCalledWith(expect.objectContaining({ attempts: 1, last_status: 401 }));
    expect(updated.update.mock.calls[0]?.[0]).not.toHaveProperty("synced_at");
  });
});