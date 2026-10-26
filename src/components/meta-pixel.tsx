import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";

export const META_PIXEL_ID = "1117842984331501";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; push: unknown; loaded: boolean; version: string };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq; __educommercePixelInit?: boolean } }

/** Loads the official Meta base code once and inits this pixel ID once. Skips if another snippet already defined fbq. */
function ensurePixel() {
  const w = window;
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args); else n.queue.push(args);
    } as Fbq;
    w.fbq = n; if (!w._fbq) w._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    if (!document.querySelector('script[src*="connect.facebook.net/en_US/fbevents.js"]')) {
      const t = document.createElement("script");
      t.async = true; t.src = "https://connect.facebook.net/en_US/fbevents.js";
      const s = document.getElementsByTagName("script")[0];
      s?.parentNode?.insertBefore(t, s);
    }
  }
  if (!w.__educommercePixelInit) { w.fbq("init", META_PIXEL_ID); w.__educommercePixelInit = true; }
  return w.fbq;
}

export function MetaPixel() {
  const location = useLocation();
  const last = useRef<string | null>(null);
  useEffect(() => {
    // One PageView per distinct URL: survives StrictMode double effects and re-renders.
    const key = location.pathname + location.searchStr;
    if (last.current === key) return;
    last.current = key;
    ensurePixel()("track", "PageView");
  }, [location.pathname, location.searchStr]);
  return null;
}

export function MetaPixelNoscript() {
  return (
    <noscript>
      <img height="1" width="1" style={{ display: "none" }} alt=""
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
    </noscript>
  );
}
