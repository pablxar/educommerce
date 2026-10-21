/** Session identifiers only: never persist telephone, name or email in browser storage. */
let fallbackSession: string | undefined;
export function journeySession() {
  fallbackSession ??= crypto.randomUUID();
  try {
    const existing = sessionStorage.getItem("edu_journey");
    if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
    sessionStorage.setItem("edu_journey", fallbackSession);
  } catch { /* Storage may be unavailable. */ }
  return fallbackSession;
}