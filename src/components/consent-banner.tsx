import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { advertisingConsent, OPEN_CONSENT_EVENT, setAdvertisingConsent } from "@/lib/meta-consent";

/** Advertising-cookie notice. Necessary cookies never depend on this decision. */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!advertisingConsent()) setOpen(true);
    const show = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, show);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, show);
  }, []);
  if (!open) return null;
  const decide = (granted: boolean) => { setAdvertisingConsent(granted); setOpen(false); };
  return (
    <section className="consent-banner" role="dialog" aria-live="polite" aria-labelledby="consent-title">
      <h2 id="consent-title">Cookies publicitarias</h2>
      <p>
        Usamos cookies necesarias para que el sitio y tus compras funcionen. Con tu permiso, también usamos cookies de Meta para medir nuestros anuncios.{" "}
        <Link to="/privacidad">Más información</Link>
      </p>
      <div className="consent-actions">
        <Button type="button" variant="outline" size="sm" onClick={() => decide(false)}>Rechazar</Button>
        <Button type="button" size="sm" onClick={() => decide(true)}>Aceptar</Button>
      </div>
    </section>
  );
}
