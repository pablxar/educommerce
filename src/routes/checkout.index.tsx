import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { checkoutContactSchema } from "@/lib/checkout-schema";
import { journeySession } from "@/lib/journey";
import { ArrowRight, Check, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { formatPrice, fullProgram, installmentPrice } from "@/lib/educommerce";
import { getProduct, PACK_ID } from "@/lib/products";
import { PlusPlanOptions } from "@/components/plus-plan-options";
import { createCheckout, saveCheckoutLead } from "@/lib/checkout.functions";
import { readAttribution } from "@/lib/attribution";
import { productTracking } from "@/lib/purchase-tracking";
import { captureMetaAttribution } from '@/lib/meta-consent';
import { trackInitiateCheckout } from '@/components/meta-pixel';

export const Route = createFileRoute("/checkout/")({
  validateSearch: (s: Record<string, unknown>) => ({ producto: typeof s["producto"] === "string" ? s["producto"] : PACK_ID }),
  head: () => ({ meta: [
    { title: "Checkout | Educommerce" },
    { name: "description", content: "Completa tu compra en Educommerce con Mercado Pago, hasta 6 cuotas sin interés." },
    { property: "og:title", content: "Checkout | Educommerce" },
    { property: "og:description", content: "Paga con Mercado Pago y accede al campus con tu correo." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: CheckoutPage,
});

const schema = checkoutContactSchema;

function CheckoutPage() {
  const { producto } = Route.useSearch();
  const product = getProduct(producto);
  const start = useServerFn(createCheckout);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const saveLead = useServerFn(saveCheckoutLead);
  const leadId = useRef<string | null>(null);
  const lastSaved = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<Promise<unknown>>(Promise.resolve());
  const [saveError, setSaveError] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);

  function contactId() {
    if (leadId.current) return leadId.current;
    try {
      const key = `edu_checkout_${journeySession()}_${product?.id ?? ""}`;
      leadId.current = sessionStorage.getItem(key) ?? crypto.randomUUID();
      sessionStorage.setItem(key, leadId.current);
    } catch { leadId.current = crypto.randomUUID(); }
    return leadId.current;
  }

  function captureLead(form: HTMLFormElement) {
    clearTimeout(timer.current);
    if (!product) return;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) return;
    const key = `${product.id}|${parsed.data.email}|${parsed.data.name}|${parsed.data.phone}`;
    if (key === lastSaved.current) return;
    lastSaved.current = key;
    const data = { leadId: contactId(), sessionId: journeySession(), productId: product.id, ...parsed.data, attribution: readAttribution() };
    pending.current = pending.current.catch(() => undefined).then(async () => {
      const res = await saveLead({ data });
      if (!res.ok) throw new Error("Save failed");
      setSaveError(false);
    }).catch(() => { lastSaved.current = ""; setSaveError(true); });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product || sending) return;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa tus datos"); return; }
    if (!parsed.data.phone) { setError("Escribe tu teléfono con código de país"); return; }
    clearTimeout(timer.current);
    setError(""); setSending(true);
    try {
      await pending.current;
      const captured = captureMetaAttribution();
      const meta = ['https://educommerce.cl','https://www.educommerce.cl'].includes(window.location.origin) ? captured : undefined;
      const res = await start({ data: { productId: product.id, ...parsed.data, sessionId: journeySession(), attribution: readAttribution(), leadId: contactId(), meta } });
      if (!res.ok) { setError(res.error); setSending(false); return; }
      trackInitiateCheckout(res.orderId, product.id);
      // Brief pause lets the pixel request leave before navigating away.
      setTimeout(() => { window.location.href = res.url; }, 150);
    } catch { setError("No pudimos conectar con Mercado Pago. Inténtalo de nuevo."); setSending(false); }
  }

  return <>
    <SiteHeader />
    <main className="shell checkout-page">
      {!product ? (
        <section className="checkout-empty"><h1>Este producto no está disponible</h1><p>Algunos módulos solo vienen en Educommerce Plus.</p><Button asChild><Link to="/educommerce-plus">Ver Educommerce Plus</Link></Button></section>
      ) : (
        <div className="checkout-grid">
          <section className="checkout-summary" aria-labelledby="summary">
            <p className="eyebrow">TU COMPRA</p>
            <h1 id="summary">{product.title}</h1>
            <p className="checkout-price">{product.listPrice > product.price && <del>{formatPrice(product.listPrice)}</del>} <strong>{formatPrice(product.price)}</strong></p>
            {product.kind === "bundle" && <p className="my-3 text-sm text-primary"><strong>20% de descuento aplicado</strong><br /><span className="text-foreground">Promoción: {productTracking(product).discount_code} · Ahorras {formatPrice(product.listPrice - product.price)}</span></p>}
            {product.kind === "bundle" && <ul className="checkout-list mb-5">{product.moduleIds.map(id => <li key={id}><Check aria-hidden="true" />{getProduct(id)?.title}</li>)}</ul>}
            <p className="checkout-installments">Hasta {fullProgram.installments} cuotas sin interés de {formatPrice(installmentPrice(product.price))}</p>
            {product.kind === "pack" ? (
              <><ul className="checkout-list">{product.benefits?.map(b => <li key={b}><Check aria-hidden="true" />{b}</li>)}</ul><p className="my-4 text-sm">Pago único · {product.access === "one_year" ? "Un año de acceso" : "Acceso de por vida"}</p><PlusPlanOptions selectedId={product.id} /></>
            ) : (
              <div className="checkout-upgrade">
                <p><strong>¿Y si lo tienes todo?</strong> Educommerce Plus incluye los 9 módulos desde {formatPrice(fullProgram.price)} por un año, con opciones de acceso de por vida y acompañamiento.</p>
                <Button asChild variant="link"><Link to="/educommerce-plus">Ver Educommerce Plus</Link></Button>
              </div>
            )}
          </section>
          <form className="checkout-form" onSubmit={onSubmit} onBlur={e => captureLead(e.currentTarget)} onChange={e => {
            const form = e.currentTarget;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => captureLead(form), 700);
          }} noValidate>
            <h2>Tus datos</h2>
            <p>Usa el correo con el que entrarás al campus. Si aún no tienes cuenta, la creas después con ese mismo correo. Guardamos tu nombre, correo y teléfono para gestionar tu compra y ayudarte si no la terminas; esto no te suscribe al newsletter. <Link to="/privacidad">Ver privacidad</Link>.</p>
            <label>Nombre<input name="name" autoComplete="name" required maxLength={100} /></label>
            <label>Correo<input name="email" type="email" autoComplete="email" required maxLength={255} /></label>
            <label>Teléfono<input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+56 9 1234 5678" required maxLength={30} /></label>
            {saveError && <p className="form-error" role="status">No pudimos guardar tus datos todavía. Volveremos a intentarlo al pagar.</p>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit" size="lg" disabled={sending}>{sending ? "Conectando con Mercado Pago…" : <>Pagar con Mercado Pago <ArrowRight aria-hidden="true" /></>}</Button>
            <p className="checkout-trust"><Lock aria-hidden="true" /> Pago seguro en Mercado Pago · <ShieldCheck aria-hidden="true" /> Garantía {fullProgram.guaranteeDays} días</p>
            <p className="checkout-legal">Al pagar aceptas los <Link to="/terminos">Términos</Link> y la <Link to="/privacidad">Política de privacidad</Link>.</p>
          </form>
        </div>
      )}
    </main>
    <SiteFooter />
  </>;
}
