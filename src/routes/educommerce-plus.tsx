import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CreditCard, Crown, GraduationCap, MonitorPlay, ShieldCheck, Tag, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { formatPrice, fullProgram, installmentPrice, modules } from "@/lib/educommerce";
import { plusPlans } from "@/lib/products";
import box from "@/assets/program-box.png.asset.json";
import f1 from "@/assets/plus-foto_producto_1.jpg.asset.json";
import f2 from "@/assets/plus-foto_producto_2.jpg.asset.json";
import f3 from "@/assets/plus-foto_producto_3.jpg.asset.json";
import f4 from "@/assets/plus-foto_producto_4.jpg.asset.json";
import { PlusGallery } from "@/components/plus-gallery";
import { AlertTriangle, Quote, Rocket, Target, TrendingUp, Users } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveSiteActivity } from "@/lib/site-activity.functions";
import { journeySession } from "@/lib/journey";
import { readAttribution } from "@/lib/attribution";

const gallery = [
  { src: box.url, alt: "Caja del programa Educommerce Plus con las herramientas de sus módulos" },
  { src: f1.url, alt: "Educommerce Plus: todo conectado en un solo programa" },
  { src: f2.url, alt: "Educommerce Plus: foto de producto 2" },
  { src: f3.url, alt: "Educommerce Plus: foto de producto 3" },
  { src: f4.url, alt: "Educommerce Plus: foto de producto 4" },
];

const title = "Educommerce Plus | 9 módulos desde $199.990 CLP";
const description = "Aprende e-commerce, publicidad, contenido y web con Educommerce Plus. Elige un año, acceso de por vida o acompañamiento. Pago con Mercado Pago.";
export const Route = createFileRoute("/educommerce-plus")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: box.url }, { name: "twitter:image", content: box.url },
  ] }),
  component: PlusPage,
});

// Cumulative upsells: each checkbox upgrades to the next plan, prices stay
// resolved server-side from the same catalog.
const upsells = [
  { label: "Acceso de por vida", note: "Amplía tu acceso sin fecha de término.", delta: plusPlans[1].price - plusPlans[0].price },
  { label: "Asesoría 1 a 1 + WhatsApp", note: "Una llamada y un grupo para dudas pequeñas.", delta: plusPlans[2].price - plusPlans[1].price },
  { label: "Clases grupales + VIP", note: "Una clase semanal por un mes y grupo VIP.", delta: plusPlans[3].price - plusPlans[2].price },
];

function PlusPage() {
  const [tier, setTier] = useState(0);
  const plan = plusPlans[tier] ?? plusPlans[0];
  const saveActivity = useServerFn(saveSiteActivity);
  function selectTier(next: number) {
    setTier(next);
    const selected = plusPlans[next];
    if (!selected) return;
    const data = { id: crypto.randomUUID(), sessionId: journeySession(), event: "upsell_selected" as const,
      productId: selected.id, path: "/educommerce-plus", attribution: readAttribution() };
    saveActivity({ data }).catch(() => saveActivity({ data }).catch(() => undefined));
  }

  useEffect(() => {
    document.body.classList.add("plus-product-page");
    return () => document.body.classList.remove("plus-product-page");
  }, []);

  return <><SiteHeader announcement={<><span className="top-strip-tag">Lanzamiento</span><span className="desktop-only">Educommerce Plus con los 9 módulos · hasta 6 cuotas sin interés</span><span className="mobile-only">9 módulos · 6 cuotas sin interés</span></>} /><main className="plus-page">
    <section className="plus-product shell" aria-labelledby="plus-title">
      <PlusGallery images={gallery} />
      <div className="plus-buybox">
        <p className="plus-badge"><Crown aria-hidden="true" /> Educommerce Plus · 9 módulos</p>
        <h1 id="plus-title">Educommerce <span>Plus</span></h1>
        <p className="plus-tagline">Crea tu tienda, tus anuncios, tu contenido y tu web con clases grabadas y prácticas, a tu ritmo.</p>
        <div className="plus-offer" aria-label="Personalizar Educommerce Plus">
          <div className="plus-offer-header">
            <div className="plus-offer-top">
              <p className="plus-offer-kicker">Plan anual · 9 módulos</p>
              <p className="plus-offer-access">Acceso por 1 año</p>
            </div>
            <p className="plus-offer-price">{formatPrice(plusPlans[0].price)} <span>CLP</span></p>
            <ul className="plus-offer-features">
              <li><Check aria-hidden="true" /><span>Clases grabadas</span></li>
              <li><Check aria-hidden="true" /><span>Acceso inmediato</span></li>
              <li><Check aria-hidden="true" /><span>6 cuotas sin interés</span></li>
            </ul>
            <p className="plus-offer-launch" role="note"><Tag aria-hidden="true" /><span><strong>Precio de lanzamiento.</strong> Sube al terminar el lanzamiento.</span></p>
          </div>
          <div className="plus-offer-body">
        <fieldset className="plus-upsells">
          <legend>Personaliza tu programa</legend>
          {upsells.map((upsell, i) => <label key={upsell.label} className="plus-upsell">
            <input type="checkbox" checked={tier > i} onChange={() => selectTier(tier > i ? i : i + 1)} />
            <span className="plus-upsell-text"><strong>{upsell.label}</strong><small>{upsell.note}</small></span>
            <span className="plus-upsell-price">+{formatPrice(upsell.delta)}</span>
          </label>)}
        </fieldset>
        <p className="plus-total-row" aria-live="polite"><span>{tier === 0 ? "Total sin extras" : "Total con extras"}</span><strong>{formatPrice(plan.price)} <span>CLP</span></strong></p>
        <div className="plus-buy">
          <Button asChild size="lg"><Link to="/checkout" search={{ producto: plan.id }}>Agregar al carrito <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
        <div className="plus-offer-guarantee"><ShieldCheck aria-hidden="true" /><div><strong>{fullProgram.guaranteeDays} días de garantía</strong><Link to="/terminos">Ver condiciones</Link></div></div>
        <p className="plus-pay-note"><CreditCard aria-hidden="true" /> 6 cuotas de {formatPrice(installmentPrice(plan.price))} sin interés con Mercado Pago.</p>
        <p className="plus-terms-note">Pago único. Los extras son acumulativos e incluyen los beneficios anteriores.</p>
          </div>
        </div>
        <figure className="plus-mini-review">
          <img src={stories[0].photo} alt="" loading="lazy" />
          <div><blockquote>“Pasé de solo consumir contenido a generar plata con lo digital.”</blockquote><figcaption><Stars /> {stories[0].name}</figcaption></div>
        </figure>
      </div>
    </section>
    <div className="plus-ticker" aria-hidden="true"><div>{Array.from({ length: 2 }, (_, k) => <span key={k}>Precio de lanzamiento · Acceso inmediato · 6 cuotas sin interés · Garantía de {fullProgram.guaranteeDays} días · 9 módulos · </span>)}</div></div>
    <section className="shell plus-section" aria-labelledby="plus-benefits-title">
      <p className="eyebrow">POR QUÉ PLUS</p><h2 id="plus-benefits-title">Todo lo que necesitas para vender online.</h2>
      <div className="plus-benefits">{[
        [Rocket, "Lanza tu tienda", "Crea tu e-commerce en Shopify y tu web con IA, paso a paso."],
        [Target, "Anuncia con estrategia", "Meta Ads y Google Ads con creatividades y guiones que puedes aplicar."],
        [TrendingUp, "Fideliza clientes", "Automatizaciones de email marketing con Klaviyo."],
        [Users, "Acompañamiento opcional", "Suma asesoría 1 a 1, grupo de WhatsApp y clases grupales."],
      ].map(([Icon, t, d]) => { const I = Icon as typeof Rocket; return <article key={t as string}><I aria-hidden="true" /><h3>{t as string}</h3><p>{d as string}</p></article>; })}</div>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-steps-title">
      <p className="eyebrow">CÓMO FUNCIONA</p><h2 id="plus-steps-title">Empiezas hoy, en 3 pasos.</h2>
      <ol className="plus-steps">
        <li><span>1</span><div><strong>Elige tu plan</strong><p>Marca los extras que quieras y paga con Mercado Pago.</p></div></li>
        <li><span>2</span><div><strong>Ingresa al campus</strong><p>Accede de inmediato con el mismo correo de tu compra.</p></div></li>
        <li><span>3</span><div><strong>Aplica a tu proyecto</strong><p>Clases grabadas y prácticas para avanzar a tu ritmo.</p></div></li>
      </ol>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-compare-title">
      <h2 id="plus-compare-title">Por separado vs. Educommerce Plus.</h2>
      <div className="plus-compare-table">
        <div><small>Módulos por separado</small><s>{formatPrice(fullProgram.originalPrice)}</s><p>Sin Mentalidad (exclusivo del programa)</p></div>
        <div className="is-best"><small>Educommerce Plus</small><strong>{formatPrice(fullProgram.price)}</strong><p>Los 9 módulos · ahorras {formatPrice(fullProgram.originalPrice - fullProgram.price)}</p></div>
      </div>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-stories-title">
      <h2 id="plus-stories-title" className="plus-stories-title">Conoce sus <span>experiencias.</span></h2>
      <p className="section-subtitle">Qué aprendieron, cómo lo aplicaron y qué cambió en su trabajo.</p>
      <div className="plus-stories">{stories.map(s => <StoryCard key={s.name} story={s} />)}</div>
    </section>
    <div className="plus-ticker is-alt" aria-hidden="true"><div>{Array.from({ length: 2 }, (_, k) => <span key={k}>El precio de lanzamiento sube al terminar el lanzamiento · Asegura tu acceso hoy · </span>)}</div></div>
    <section className="shell plus-section" aria-labelledby="plus-guarantee-title">
      <h2 id="plus-guarantee-title" className="sr-only">Garantía</h2>
      <div className="plus-guarantee-card"><span className="plus-guarantee-seal" aria-hidden="true"><strong>{fullProgram.guaranteeDays}</strong><small>días</small></span><div><h3>Garantía de devolución de {fullProgram.guaranteeDays} días</h3><ul><li><Check aria-hidden="true" /> Devolución del 100% de tu pago</li><li><Check aria-hidden="true" /> Válida si has visto más del 50% de las cápsulas</li><li><Check aria-hidden="true" /> Solicítala desde la página de contacto</li></ul><Link to="/terminos">Ver términos completos</Link></div></div>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-content-title">
      <p className="eyebrow">TODO CONECTADO</p><h2 id="plus-content-title">Qué incluye Educommerce Plus.</h2><p className="section-subtitle">Todos los planes incluyen los 9 módulos, también los exclusivos del programa.</p>
      <ol className="plus-curriculum">{modules.map(m => <li key={m.id}><span>{String(m.number).padStart(2, "0")}</span><div><strong>{m.title}</strong><small>{m.category}</small></div><Check aria-label="Incluido" /></li>)}</ol>
    </section>
    <section className="shell plus-section plus-questions" aria-labelledby="plus-questions-title"><h2 id="plus-questions-title">Antes de empezar.</h2>
      {[
        ["¿Qué incluye Educommerce Plus?", "Los 9 módulos de habilidades digitales de Educommerce, con clases grabadas y aprendizaje práctico. El acceso y el acompañamiento dependen del plan que elijas."],
        ["¿Cómo funciona el acceso de por vida?", "Por $20.000 adicionales al plan anual, el total queda en $219.990 y tu acceso pasa a ser de por vida. Los planes con asesoría y VIP ya lo incluyen."],
        ["¿Qué incluye el acompañamiento?", "Plus con asesoría incluye una asesoría por llamada y un grupo WhatsApp para dudas pequeñas. Plus VIP incluye lo anterior, una clase semanal grupal durante un mes y un grupo VIP."],
        ["¿Necesito una cuenta para comprar?", "No. Puedes comprar con tu nombre y correo; después ingresa al campus con ese mismo correo para asociar tu compra."],
        ["¿Cómo pago?", "Elige tu plan, completa tus datos y paga de forma segura en Mercado Pago. Los precios están en pesos chilenos, con hasta 6 cuotas sin interés."],
        ["¿Tengo garantía?", `Sí: ${fullProgram.guaranteeDays} días de garantía de devolución completa, válida si has visto más del 50% de las cápsulas.`],
      ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
    </section>
    <section className="shell plus-section plus-final-cta" aria-label="Comprar Educommerce Plus">
      <p className="plus-alert is-pulse" role="note"><AlertTriangle aria-hidden="true" /> <span><strong>Oferta de lanzamiento:</strong> este precio no se mantendrá.</span></p><h2>Empieza hoy con {plan.name}.</h2><p>{formatPrice(plan.price)} · o 6 cuotas de {formatPrice(installmentPrice(plan.price))} sin interés</p>
      <Button asChild size="lg"><Link to="/checkout" search={{ producto: plan.id }}>Quiero Educommerce Plus <ArrowRight aria-hidden="true" /></Link></Button>
    </section>
    <div className="plus-sticky-bar">
      <div className="plus-sticky-inner">
        <div className="plus-sticky-info">
          <p className="plus-sticky-live"><i aria-hidden="true" /> Precio lanzamiento</p><p className="plus-sticky-name">{plan.name}</p>
          <p className="plus-sticky-price">{formatPrice(plan.price)}</p>
        </div>
        <Button asChild><Link to="/checkout" search={{ producto: plan.id }}>Agregar al carrito <ArrowRight aria-hidden="true" /></Link></Button>
      </div>
    </div>
  </main><SiteFooter /></>;
}
