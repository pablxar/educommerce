import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Gift, Hammer, Lock, Target, Wrench, Video, Infinity, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { PackUpsell } from "@/components/pack-upsell";
import { formatPrice, getModule, installmentPrice, fullProgram } from "@/lib/educommerce";
import { bundlesFor, moduleDetails } from "@/lib/products";
import { moduleImages } from "@/lib/module-images";
import { moduleMedia } from "@/lib/module-media";
import { ModuleProductMedia } from "@/components/module-product-media";

export const Route = createFileRoute("/modulos/$moduleId")({
  loader: ({ params }) => {
    const m = getModule(params.moduleId);
    if (!m) throw notFound();
    return { id: m.id };
  },
  head: ({ loaderData }) => {
    const m = loaderData ? getModule(loaderData.id) : undefined;
    const title = m ? `${m.title} | Educommerce` : "Módulo | Educommerce";
    const desc = m ? `${m.description} ${m.price ? `Desde ${formatPrice(m.price)} o en el Educommerce Plus.` : "Incluido en el Educommerce Plus."}` : "Módulo de Educommerce.";
    return { meta: [
      { title }, { name: "description", content: desc },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: ModulePage,
});

function ModulePage() {
  const { id } = Route.useLoaderData();
  const m = getModule(id);
  const d = moduleDetails[id];
  const img = moduleImages[id];
  if (!m || !d) throw notFound();
  const combos = m.price ? bundlesFor(id) : [];

  return <>
    <SiteHeader />
    <main className="shell module-page">
      <nav className="module-crumbs" aria-label="Ruta"><Link to="/modulos">Módulos</Link> / <span>{m.title}</span></nav>
      <section className="module-hero">
        <ModuleProductMedia key={id} media={moduleMedia[id]} title={m.title} />
        <div className="module-hero-copy">
          <p className="eyebrow">MÓDULO {String(m.number).padStart(2, "0")} · {m.category.toUpperCase()}</p>
          <h1>{m.title}</h1>
          <p className="module-hero-tagline">{d.tagline}</p>
          <p className="section-subtitle">{m.description}</p>
          <div className="module-hero-chips"><span>Nivel: {d.level}</span>{d.tools.map(t => <span key={t}>{t}</span>)}</div>
          {m.price ? (
            <div className="module-hero-buy">
              <p className="module-hero-price"><strong>{formatPrice(m.price)}</strong><span>o {fullProgram.installments} cuotas sin interés de {formatPrice(installmentPrice(m.price))}</span></p>
              <div className="module-hero-actions">
                <Button asChild size="lg"><Link to="/checkout" search={{ producto: id }}>Comprar módulo <ArrowRight aria-hidden="true" /></Link></Button>
                <Button asChild size="lg" variant="secondary"><Link to="/educommerce-plus">Ver Educommerce Plus</Link></Button>
              </div>
            </div>
          ) : (
            <div className="module-hero-buy module-locked">
              <p><Lock aria-hidden="true" /> Este módulo no se vende por separado: viene incluido en el Educommerce Plus.</p>
              <Button asChild size="lg"><Link to="/educommerce-plus">Obtener el Educommerce Plus <ArrowRight aria-hidden="true" /></Link></Button>
            </div>
          )}
          <p className="product-payment-note"><CreditCard aria-hidden="true" /> Pago seguro con Mercado Pago · Precios en CLP</p>
        </div>
      </section>

      <ul className="product-inclusions" aria-label="Formato y acceso">
        <li><Video aria-hidden="true" /><div><strong>Clases grabadas</strong><span>100% online, a tu ritmo</span></div></li>
        <li><Hammer aria-hidden="true" /><div><strong>Aprendizaje práctico</strong><span>Aplicado a tu propio proyecto</span></div></li>
        <li><Infinity aria-hidden="true" /><div><strong>{m.price ? "Acceso de por vida" : "Acceso según tu plan Plus"}</strong><span>{m.price ? "Actualizaciones incluidas" : "Un año o de por vida"}</span></div></li>
      </ul>

      <nav className="product-section-nav" aria-label="Información del módulo">
        <Link to="/modulos/$moduleId" params={{ moduleId: id }} hash="learn">Contenido</Link>
        <Link to="/modulos/$moduleId" params={{ moduleId: id }} hash="project">Proyecto final</Link>
        <Link to="/modulos/$moduleId" params={{ moduleId: id }} hash="forwho">¿Es para ti?</Link>
        <Link to="/modulos/$moduleId" params={{ moduleId: id }} hash="product-pack">Educommerce Plus</Link>
      </nav>

      <div className="product-detail-grid">
      <section id="learn" className="module-section" aria-labelledby="learn-title">
        <p className="eyebrow">CONTENIDO DEL MÓDULO</p>
        <h2 id="learn-title"><Wrench aria-hidden="true" /> Lo que vas a dominar</h2>
        <ol className="module-learn">
          {d.learn.map((l, i) => <li key={l}><span>{String(i + 1).padStart(2, "0")}</span><p>{l}</p></li>)}
        </ol>
      </section>

      <section id="project" className="module-section module-project" aria-labelledby="project-title">
        <p className="eyebrow">DE LA CLASE A LA PRÁCTICA</p>
        <h2 id="project-title">Tu proyecto final</h2>
        <p>{d.project}</p>
        <div className="product-project-tools"><span>Herramientas que usarás</span><strong>{d.tools.join(" · ")}</strong></div>
        <Button asChild variant="secondary">{m.price ? <Link to="/checkout" search={{ producto: id }}>Quiero aprender esta habilidad<ArrowRight aria-hidden="true" /></Link> : <Link to="/educommerce-plus">Ver Educommerce Plus<ArrowRight aria-hidden="true" /></Link>}</Button>
      </section>
      </div>

      <section id="forwho" className="module-section module-forwho" aria-labelledby="forwho-title">
        <p className="eyebrow">TU SIGUIENTE HABILIDAD</p>
        <h2 id="forwho-title"><Target aria-hidden="true" /> Este módulo es para ti si…</h2>
        <ul>{d.forWho.map(f => <li key={f}><Check aria-hidden="true" />{f}</li>)}</ul>
      </section>

      {combos.length > 0 && (
        <section className="module-section" aria-labelledby="combos">
          <h2 id="combos"><Gift aria-hidden="true" /> Combínalo y ahorra 20%</h2>
          <div className="combo-grid">
            {combos.map(c => {
               const otherId = c.moduleIds.find(x => x !== id);
               if (!otherId) return null;
               const other = getModule(otherId);
               if (!other) return null;
              const otherImg = moduleImages[otherId];
              return (
                <article className="combo-card" key={c.id}>
                  <div className="combo-pair">
                    {img && <img src={img} alt="" width={120} height={75} loading="lazy" />}
                    <span aria-hidden="true">+</span>
                    {otherImg && <img src={otherImg} alt="" width={120} height={75} loading="lazy" />}
                  </div>
                  <h3>{m.title} + {other.title}</h3>
                  <p className="combo-price"><del>{formatPrice(c.listPrice)}</del> <strong>{formatPrice(c.price)}</strong> <span className="combo-off">-20%</span></p>
                  <p className="combo-installments">{fullProgram.installments} cuotas de {formatPrice(installmentPrice(c.price))}</p>
                  <div className="combo-actions">
                    <Button asChild variant="secondary"><Link to="/checkout" search={{ producto: c.id }}>Llevar combo</Link></Button>
                    <Link className="combo-link" to="/modulos/$moduleId" params={{ moduleId: otherId }}>Ver {other.title}</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div id="product-pack"><PackUpsell /></div>
    </main>
    <SiteFooter />
  </>;
}
