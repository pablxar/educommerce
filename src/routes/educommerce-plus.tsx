import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CreditCard, Crown, GraduationCap, MonitorPlay, ShieldCheck, Timer, Zap } from "lucide-react";
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
import { AlertTriangle, BadgeCheck, Quote, Rocket, Target, TrendingUp, Users } from "lucide-react";

const gallery = [
  { src: box.url, alt: "Caja del programa Educommerce Plus con las herramientas de sus módulos" },
  { src: f1.url, alt: "Educommerce Plus: todo conectado en un solo programa" },
  { src: f2.url, alt: "Educommerce Plus: foto de producto 2" },
  { src: f3.url, alt: "Educommerce Plus: foto de producto 3" },
  { src: f4.url, alt: "Educommerce Plus: foto de producto 4" },
];

const title = "Educommerce Plus | 10 módulos desde $199.990 CLP";
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
  { label: "Acceso de por vida", note: "Tu acceso no vence nunca: olvídate del plazo de un año.", delta: plusPlans[1].price - plusPlans[0].price },
  { label: "Asesoría 1 a 1 + grupo WhatsApp", note: "Una asesoría por llamada y un grupo de WhatsApp para dudas pequeñas.", delta: plusPlans[2].price - plusPlans[1].price },
  { label: "Clases grupales + grupo VIP", note: "Una clase grupal semanal durante un mes y acceso al grupo VIP.", delta: plusPlans[3].price - plusPlans[2].price },
];

function PlusPage() {
  const [tier, setTier] = useState(0);
  const plan = plusPlans[tier] ?? plusPlans[0];

  useEffect(() => {
    document.body.classList.add("plus-product-page");
    return () => document.body.classList.remove("plus-product-page");
  }, []);

  return <><SiteHeader announcement={<><span className="top-strip-tag">Lanzamiento</span><span className="desktop-only">Educommerce Plus con los 10 módulos · hasta 6 cuotas sin interés</span><span className="mobile-only">10 módulos · 6 cuotas sin interés</span></>} /><main className="plus-page">
    <section className="plus-product shell" aria-labelledby="plus-title">
      <PlusGallery images={gallery} />
      <div className="plus-buybox">
        <p className="plus-badge"><Crown aria-hidden="true" /> Educommerce Plus · 10 módulos</p>
        <h1 id="plus-title">Todo el sistema de e-commerce en <span>un solo programa.</span></h1>
        <p className="plus-tagline">Crea tu tienda, tus anuncios, tu contenido y tu web con clases grabadas y prácticas, a tu ritmo.</p>
        <div className="plus-chips">
          <span><ShieldCheck aria-hidden="true" /> {fullProgram.guaranteeDays} días de garantía</span>
          <span><Zap aria-hidden="true" /> Acceso inmediato</span>
          <span><CreditCard aria-hidden="true" /> Hasta 6 cuotas sin interés</span>
        </div>
        <div className="plus-price-row">
          <span className="plus-price">{formatPrice(plan.price)}</span>
          <span className="plus-compare">{formatPrice(fullProgram.originalPrice)}</span>
          <span className="plus-save">Ahorras {formatPrice(fullProgram.originalPrice - plan.price)}</span>
        </div>
        <p className="plus-alert" role="note"><AlertTriangle aria-hidden="true" /> <span><strong>Precio de lanzamiento para early adopters.</strong> Sube cuando termine el lanzamiento.</span></p>
        <fieldset className="plus-upsells">
          <legend>Suma a tu programa</legend>
          {upsells.map((upsell, i) => <label key={upsell.label} className="plus-upsell">
            <input type="checkbox" checked={tier > i} onChange={() => setTier(tier > i ? i : i + 1)} />
            <span className="plus-upsell-text"><strong>{upsell.label}{i === 1 && <em className="plus-upsell-tag">Más elegido</em>}</strong><small>{upsell.note}</small></span>
            <span className="plus-upsell-price">+{formatPrice(upsell.delta)}</span>
          </label>)}
        </fieldset>
        <p className="plus-total-row"><span>Total · {plan.name}</span><strong>{formatPrice(plan.price)}</strong></p>
        <div className="plus-buy">
          <Button asChild size="lg"><Link to="/checkout" search={{ producto: plan.id }}>Agregar al carrito <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
        <p className="plus-pay-note"><CreditCard aria-hidden="true" /> Paga en 6 cuotas de {formatPrice(installmentPrice(plan.price))} sin interés con Mercado Pago. Acceso inmediato después del pago.</p>
        <p className="plus-terms-note">Todos son pagos únicos. El plan anual cubre un año de acceso; los demás incluyen acceso de por vida.</p>
      </div>
    </section>
    <div className="shell"><div className="plus-facts">
      <ul>
        <li><GraduationCap aria-hidden="true" /><span><strong>10 módulos</strong> en un solo programa</span></li>
        <li><MonitorPlay aria-hidden="true" /><span><strong>100% online</strong> · clases grabadas</span></li>
        <li><Timer aria-hidden="true" /><span><strong>A tu ritmo</strong> · aplicado a tus proyectos</span></li>
        <li><ShieldCheck aria-hidden="true" /><span><strong>{fullProgram.guaranteeDays} días</strong> de garantía</span></li>
      </ul>
    </div></div>
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
        <div><small>Módulos por separado</small><s>{formatPrice(fullProgram.originalPrice)}</s><p>Sin Mentalidad ni Monetiza (exclusivos del programa)</p></div>
        <div className="is-best"><small>Educommerce Plus</small><strong>{formatPrice(fullProgram.price)}</strong><p>Los 10 módulos · ahorras {formatPrice(fullProgram.originalPrice - fullProgram.price)}</p></div>
      </div>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-stories-title">
      <p className="eyebrow">HISTORIAS DE ALUMNOS</p><h2 id="plus-stories-title">Lo que dicen quienes ya lo cursan.</h2>
      <div className="plus-stories">{[1, 2, 3].map(n => <figure key={n} className="plus-story is-placeholder"><Quote aria-hidden="true" /><blockquote>Espacio reservado para el testimonio real de un alumno.</blockquote><figcaption><span className="plus-story-avatar" aria-hidden="true" /><span><strong>Alumno {n}</strong><small>Testimonio pendiente</small></span></figcaption></figure>)}</div>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-guarantee-title">
      <div className="plus-guarantee"><BadgeCheck aria-hidden="true" /><div><h2 id="plus-guarantee-title">Garantía de {fullProgram.guaranteeDays} días.</h2><p>Si el programa no es para ti, pide la devolución completa dentro de {fullProgram.guaranteeDays} días, según nuestros términos. Compras sin riesgo.</p></div></div>
    </section>
    <section className="shell plus-section" aria-labelledby="plus-content-title">
      <p className="eyebrow">TODO CONECTADO</p><h2 id="plus-content-title">Qué incluye Educommerce Plus.</h2><p className="section-subtitle">Todos los planes incluyen los 10 módulos, también los exclusivos del programa.</p>
      <ol className="plus-curriculum">{modules.map(m => <li key={m.id}><span>{String(m.number).padStart(2, "0")}</span><div><strong>{m.title}</strong><small>{m.category}</small></div><Check aria-label="Incluido" /></li>)}</ol>
    </section>
    <section className="shell plus-section plus-questions" aria-labelledby="plus-questions-title"><h2 id="plus-questions-title">Antes de empezar.</h2>
      {[
        ["¿Qué incluye Educommerce Plus?", "Los 10 módulos de habilidades digitales de Educommerce, con clases grabadas y aprendizaje práctico. El acceso y el acompañamiento dependen del plan que elijas."],
        ["¿Cómo funciona el acceso de por vida?", "Por $20.000 adicionales al plan anual, el total queda en $219.990 y tu acceso pasa a ser de por vida. Los planes con asesoría y VIP ya lo incluyen."],
        ["¿Qué incluye el acompañamiento?", "Plus con asesoría incluye una asesoría por llamada y un grupo WhatsApp para dudas pequeñas. Plus VIP incluye lo anterior, una clase semanal grupal durante un mes y un grupo VIP."],
        ["¿Necesito una cuenta para comprar?", "No. Puedes comprar con tu nombre y correo; después ingresa al campus con ese mismo correo para asociar tu compra."],
        ["¿Cómo pago?", "Elige tu plan, completa tus datos y paga de forma segura en Mercado Pago. Los precios están en pesos chilenos, con hasta 6 cuotas sin interés."],
        ["¿Tengo garantía?", `Tienes ${fullProgram.guaranteeDays} días de garantía o devolución completa, según nuestros términos.`],
      ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      <p className="plus-terms-note"><ShieldCheck aria-hidden="true" /> Garantía de {fullProgram.guaranteeDays} días · <Link to="/terminos">Ver términos</Link></p>
    </section>
    <section className="shell plus-section plus-final-cta" aria-label="Comprar Educommerce Plus">
      <h2>Empieza hoy con {plan.name}.</h2><p>{formatPrice(plan.price)} · o 6 cuotas de {formatPrice(installmentPrice(plan.price))} sin interés</p>
      <Button asChild size="lg"><Link to="/checkout" search={{ producto: plan.id }}>Quiero Educommerce Plus <ArrowRight aria-hidden="true" /></Link></Button>
    </section>
    <div className="plus-sticky-bar">
      <div className="plus-sticky-inner">
        <div className="plus-sticky-info">
          <p className="plus-sticky-name">Educommerce Plus<small>{plan.name}</small></p>
          <p className="plus-sticky-price">{formatPrice(plan.price)}</p>
        </div>
        <Button asChild><Link to="/checkout" search={{ producto: plan.id }}>Agregar al carrito <ArrowRight aria-hidden="true" /></Link></Button>
      </div>
    </div>
  </main><SiteFooter /></>;
}
