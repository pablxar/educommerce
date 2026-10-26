import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { advertisingAllowed, CONSENT_EVENT } from '@/lib/meta-consent';
import { getProduct, PACK_ID } from '@/lib/products';

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
  if (!w.__educommercePixelInit) {
    // Disable automatic events (e.g. SubscribedButton) so only explicit standard events are sent.
    w.fbq("set", "autoConfig", false, META_PIXEL_ID);
    w.fbq("init", META_PIXEL_ID); w.__educommercePixelInit = true;
  }
  return w.fbq;
}

const sentCheckouts = new Set<string>();
/** Fires InitiateCheckout once per created order, only after the payment preference exists. */
export function trackInitiateCheckout(orderId: string, productId: string) {
  if (typeof window === "undefined" || !advertisingAllowed() || sentCheckouts.has(orderId)) return;
  const p = getProduct(productId); if (!p) return;
  sentCheckouts.add(orderId);
  ensurePixel()("track", "InitiateCheckout", {
    value: p.price, currency: "CLP", content_ids: [p.id], content_type: "product", num_items: 1,
    contents: [{ id: p.id, quantity: 1, item_price: p.price }],
  }, { eventID: `educommerce-checkout-${orderId}` });
}

export function MetaPixel() {
  const location = useLocation();
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = location.pathname + location.searchStr;
    const isCheckout = location.pathname.replace(/\/$/,'').startsWith('/checkout');
    const productId = location.pathname === '/educommerce-plus' ? PACK_ID : location.pathname.startsWith('/modulos/') ? location.pathname.split('/')[2] : undefined;
    const paramsFor = (id: string) => { const p=getProduct(id); return p ? { content_ids:[p.id],content_type:'product',content_name:p.title,value:p.price,currency:'CLP',num_items:1,contents:[{id:p.id,quantity:1,item_price:p.price}] } : null; };
    const view = () => {
      if (!advertisingAllowed()) { window.fbq?.('consent','revoke'); return; }
      const pixel=ensurePixel();pixel('consent','grant');
      if(last.current===key)return;
      last.current=key;pixel('track','PageView');
      const data=productId ? paramsFor(productId) : null;
      if(data) pixel('track','ViewContent',data,{eventID:crypto.randomUUID()});
    };
    const click = (event:MouseEvent) => {
      if(!advertisingAllowed() || !(event.target instanceof Element) || event.button!==0)return;
      const anchor=event.target.closest('a');if(!anchor)return;
      const url=new URL(anchor.href,window.location.origin);
      if(url.origin!==window.location.origin || url.pathname.replace(/\/$/,'')!=='/checkout' || isCheckout)return;
      const data=paramsFor(url.searchParams.get('producto')??PACK_ID);
      if(data)ensurePixel()('track','AddToCart',data,{eventID:crypto.randomUUID()});
    };
    view(); window.addEventListener(CONSENT_EVENT,view); window.addEventListener('storage',view);document.addEventListener('click',click,true);
    return()=>{window.removeEventListener(CONSENT_EVENT,view);window.removeEventListener('storage',view);document.removeEventListener('click',click,true);};
  }, [location.pathname, location.searchStr]);
  return null;
}

export function MetaPixelNoscript() {
  // A noscript request cannot check explicit advertising consent.
  return null;
}
