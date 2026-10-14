const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;
const STORAGE = "edu_attribution";

export type Attribution = Partial<Record<(typeof KEYS)[number], string>> & { landing_page?: string; referrer?: string; first_seen?: string };

export function pickAttribution(search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  for (const k of KEYS) { const v = params.get(k); if (v) out[k] = v.slice(0, 200); }
  return out;
}

/** Stores first-touch and last-touch attribution in the browser. */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const found = pickAttribution(window.location.search);
  let stored: { first?: Attribution; last?: Attribution } = {};
  try { stored = JSON.parse(localStorage.getItem(STORAGE) ?? "{}"); } catch { /* ignore */ }
  const touch: Attribution = { ...found, landing_page: window.location.pathname, ...(document.referrer ? { referrer: document.referrer.slice(0, 300) } : {}), first_seen: new Date().toISOString() };
  if (!stored.first) stored.first = touch;
  if (Object.keys(found).length) stored.last = touch;
  try { localStorage.setItem(STORAGE, JSON.stringify(stored)); } catch { /* ignore */ }
}

export function readAttribution(): { first?: Attribution; last?: Attribution } {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE) ?? "{}"); } catch { return {}; }
}
