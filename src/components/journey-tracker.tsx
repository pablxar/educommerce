import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { saveSiteActivity } from "@/lib/site-activity.functions";
import { journeySession } from "@/lib/journey";
import { readAttribution } from "@/lib/attribution";
import { PACK_ID } from "@/lib/products";

export function JourneyTracker() {
  const location = useLocation();
  const save = useServerFn(saveSiteActivity);
  useEffect(() => {
    const path = location.pathname;
    const params = new URLSearchParams(window.location.search);
    const productId = path === "/educommerce-plus" ? PACK_ID : path.startsWith("/modulos/") ? path.split("/")[2]
      : path.replace(/\/$/, "") === "/checkout" ? params.get("producto") ?? PACK_ID : undefined;
    const record = (event: "product_viewed" | "checkout_viewed" | "cart_added" | "campus_opened" | "whatsapp_opened", product?: string) => {
      const data = { id: crypto.randomUUID(), sessionId: journeySession(), event, path,
        ...(product ? { productId: product } : {}), attribution: readAttribution() };
      // Retry the same event ID; the server insert is idempotent.
      save({ data }).catch(() => save({ data }).catch(() => undefined));
    };
    if (productId) record(path.replace(/\/$/, "") === "/checkout" ? "checkout_viewed" : "product_viewed", productId);
    function click(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.replace(/\/$/, "") === "/checkout") record("cart_added", url.searchParams.get("producto") ?? PACK_ID);
      else if (url.hostname === "wa.me") record("whatsapp_opened");
      else if (url.hostname === "app.educommerce.cl") record("campus_opened");
    }
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [location.pathname, location.searchStr, save]);
  return null;
}