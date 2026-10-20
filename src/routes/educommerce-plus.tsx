import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { formatPrice, fullProgram, installmentPrice, modules } from "@/lib/educommerce";
import { plusPlans } from "@/lib/products";
import box from "@/assets/program-box.png.asset.json";

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

function PlusPage() {
  return <><SiteHeader /><main className="plus-page">
    <section className="plus-hero shell" aria-labelledby="plus-title">
      <img className="plus-hero-object" src={box.url} alt="Programa Educommerce y herramientas de aprendizaje" width={768} height={768} fetchPriority="high" />
      <div className="plus-hero-copy">
        <p className="eyebrow">10 MÓDULOS · UNA FORMACIÓN INTEGRAL</p>
        <h1 id="plus-title">Educommerce <span>Plus.</span></h1>
        <p className="plus-hero-description">Conecta las habilidades para crear tu tienda, tus anuncios, tu contenido y tu web.</p>
        <p className="plus-launch">Precio de lanzamiento <strong>{formatPrice(fullProgram.price)} <small>CLP</small></strong><span>Un año de acceso · Pago único</span></p>
        <div className="plus-hero-actions"><Button asChild size="lg"><Link to="/checkout" search={{ producto: "educommerce-plus" }}>Quiero Educommerce Plus <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/educommerce-plus" hash="planes">Ver opciones de acceso</Link></Button></div>
        <p className="plus-trust"><CreditCard aria-hidden="true" /> Mercado Pago · Hasta 6 cuotas sin interés</p>
      </div>
    </section>
    <div className="plus-facts"><div className="shell"><span><strong>10 módulos</strong> en un solo programa</span><span><strong>100% online</strong> clases grabadas</span><span><strong>A tu ritmo</strong> aplicado a tus proyectos</span></div></div>
    <section className="shell plus-section" aria-labelledby="plus-content-title">
      <p className="eyebrow">TODO CONECTADO</p><h2 id="plus-content-title">De la idea a la práctica.</h2><p className="section-subtitle">Todos los planes incluyen los 10 módulos, también los exclusivos del programa.</p>
      <ol className="plus-curriculum">{modules.map(m => <li key={m.id}><span>{String(m.number).padStart(2, "0")}</span><div><strong>{m.title}</strong><small>{m.category}</small></div><Check aria-label="Incluido" /></li>)}</ol>
    </section>
    <section id="planes" className="plus-plans-section" aria-labelledby="plus-plans-title"><div className="shell plus-section">
      <p className="eyebrow">TU ACCESO. TU ACOMPAÑAMIENTO.</p><h2 id="plus-plans-title">Elige tu Educommerce Plus.</h2><p className="section-subtitle">Empieza por un año o suma acceso de por vida y acompañamiento. Todos son pagos únicos.</p>
      <div className="plus-plans">{plusPlans.map((plan, index) => <article key={plan.id} className={`plus-plan${index === 1 ? " plus-plan-featured" : ""}`}>
        <p className="plus-plan-label">{index === 0 ? "Precio de lanzamiento" : index === 1 ? "Por $20.000 más" : index === 2 ? "Acompañamiento personal" : "Acompañamiento grupal"}</p>
        <h3>{plan.name}</h3><p className="plus-plan-price">{formatPrice(plan.price)}<small>CLP · Pago único</small></p>
        <p className="plus-plan-installments">Hasta 6 × {formatPrice(installmentPrice(plan.price))} sin interés</p>
        <ul>{plan.benefits.map(benefit => <li key={benefit}><Check aria-hidden="true" />{benefit}</li>)}</ul>
        <Button asChild size="lg" variant={index === 1 ? "default" : "outline"}><Link to="/checkout" search={{ producto: plan.id }}>Elegir {plan.name} <ArrowRight /></Link></Button>
      </article>)}</div>
      <p className="plus-plan-terms">El plan anual cubre un año de acceso. Los otros planes incluyen acceso de por vida. Plus VIP suma una clase semanal grupal durante un mes; no son clases semanales indefinidas.</p>
    </div></section>
    <section className="shell plus-section plus-questions" aria-labelledby="plus-questions-title"><h2 id="plus-questions-title">Antes de empezar.</h2>
      {[
        ["¿Qué incluye Educommerce Plus?", "Los 10 módulos de habilidades digitales de Educommerce, con clases grabadas y aprendizaje práctico. El acceso y el acompañamiento dependen del plan que elijas."],
        ["¿Cómo funciona el acceso de por vida?", "Por $20.000 adicionales al plan anual, el total queda en $219.990 y tu acceso pasa a ser de por vida. Los planes con asesoría y VIP ya lo incluyen."],
        ["¿Qué incluye el acompañamiento?", "Plus con asesoría incluye una asesoría por llamada y un grupo WhatsApp para dudas pequeñas. Plus VIP incluye lo anterior, una clase semanal grupal durante un mes y un grupo VIP."],
        ["¿Necesito una cuenta para comprar?", "No. Puedes comprar con tu nombre y correo; después ingresa al campus con ese mismo correo para asociar tu compra."],
        ["¿Cómo pago?", "Elige tu plan, completa tus datos y paga de forma segura en Mercado Pago. Los precios están en pesos chilenos, con hasta 6 cuotas sin interés."],
        ["¿Tengo garantía?", `Tienes ${fullProgram.guaranteeDays} días de garantía o devolución completa, según nuestros términos.`],
      ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      <p className="plus-trust"><ShieldCheck aria-hidden="true" /> Garantía de {fullProgram.guaranteeDays} días · <Link to="/terminos">Ver términos</Link></p>
    </section>
    <section className="plus-final"><div className="shell"><h2>Tu próximo paso, con Plus.</h2><Button asChild size="lg"><Link to="/educommerce-plus" hash="planes">Elegir mi plan <ArrowRight /></Link></Button></div></section>
  </main><SiteFooter /></>;
}