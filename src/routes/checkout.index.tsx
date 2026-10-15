import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ArrowRight, Check, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { formatPrice, fullProgram, installmentPrice } from "@/lib/educommerce";
import { getProduct, PACK_ID, packBenefits } from "@/lib/products";
import { createCheckout } from "@/lib/checkout.functions";
import { readAttribution } from "@/lib/attribution";
import { productTracking } from "@/lib/purchase-tracking";

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

const schema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre").max(100),
  email: z.string().trim().email("Escribe un correo válido").max(255),
});

function CheckoutPage() {
  const { producto } = Route.useSearch();
  const product = getProduct(producto);
  const start = useServerFn(createCheckout);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product || sending) return;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa tus datos"); return; }
    setError(""); setSending(true);
    try {
      const res = await start({ data: { productId: product.id, ...parsed.data, attribution: readAttribution() as never } });
      if (!res.ok) { setError(res.error); setSending(false); return; }
      window.location.href = res.url;
    } catch { setError("No pudimos conectar con Mercado Pago. Inténtalo de nuevo."); setSending(false); }
  }

  return <>
    <SiteHeader />
    <main className="shell checkout-page">
      {!product ? (
        <section className="checkout-empty"><h1>Este producto no está disponible</h1><p>Algunos módulos solo vienen en el Pack Completo.</p><Button asChild><Link to="/checkout" search={{ producto: PACK_ID }}>Ver Pack Completo</Link></Button></section>
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
              <ul className="checkout-list">{packBenefits.map(b => <li key={b.title}><Check aria-hidden="true" />{b.title}</li>)}</ul>
            ) : (
              <div className="checkout-upgrade">
                <p><strong>¿Y si lo tienes todo?</strong> El Pack Completo incluye todos los módulos, grupos VIP, mentorías 1 a 1 y acceso de por vida por {formatPrice(fullProgram.price)}.</p>
                <Link to="/checkout" search={{ producto: PACK_ID }}>Cambiar al Pack Completo</Link>
              </div>
            )}
          </section>
          <form className="checkout-form" onSubmit={onSubmit} noValidate>
            <h2>Tus datos</h2>
            <p>Usa el correo con el que entrarás al campus. Si aún no tienes cuenta, la creas después con ese mismo correo y tu compra aparecerá sola.</p>
            <label>Nombre<input name="name" autoComplete="name" required maxLength={100} /></label>
            <label>Correo<input name="email" type="email" autoComplete="email" required maxLength={255} /></label>
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
