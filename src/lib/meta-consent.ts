export const CONSENT_KEY = 'edu_advertising_consent';
export const CONSENT_EVENT = 'educommerce:advertising-consent';
export type AdvertisingConsent = { granted: boolean; version: '1'; updatedAt: string };
export function advertisingConsent(): AdvertisingConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? 'null');
    return c?.version === '1' && typeof c.granted === 'boolean' && Number.isFinite(Date.parse(c.updatedAt)) ? c : null;
  } catch { return null; }
}
/** Integration point for an explicit consent control; missing consent always denies advertising. */
export function setAdvertisingConsent(granted: boolean) {
  const c: AdvertisingConsent = { granted, version: '1', updatedAt: new Date().toISOString() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch { return; }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
export function advertisingAllowed() {
  return advertisingConsent()?.granted === true && navigator.globalPrivacyControl !== true;
}
declare global { interface Navigator { globalPrivacyControl?: boolean } }
export const OPEN_CONSENT_EVENT = 'educommerce:open-consent';
export function openConsentPreferences() { window.dispatchEvent(new Event(OPEN_CONSENT_EVENT)); }
/** Always returns the consent decision; browser identifiers are only included when advertising is allowed. */
export function captureMetaAttribution() {
  const sourceUrl = window.location.origin + window.location.pathname;
  const consent = advertisingConsent();
  if (!advertisingAllowed() || !consent) return { consent: { granted: false, version: '1' as const, updatedAt: consent?.updatedAt ?? new Date().toISOString() }, sourceUrl };
  const cookie = (name: string) => document.cookie.split('; ').find(x => x.startsWith(`${name}=`))?.slice(name.length + 1);
  const valid = (x?: string) => x && /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/.test(x) ? x : undefined;
  const click = new URLSearchParams(window.location.search).get('fbclid');
  return { consent, fbp: valid(cookie('_fbp')), fbc: valid(cookie('_fbc')) ?? (click && /^[A-Za-z0-9_-]{1,200}$/.test(click) ? `fb.1.${Date.now()}.${click}` : undefined), sourceUrl };
}
