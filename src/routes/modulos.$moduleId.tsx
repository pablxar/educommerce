import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Gift, Hammer, Lock, Sparkles, Target, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { PackUpsell } from "@/components/pack-upsell";
import { formatPrice, getModule, installmentPrice, fullProgram } from "@/lib/educommerce";
import { bundlesFor, moduleDetails, PACK_ID } from "@/lib/products";
import { moduleImages } from "@/lib/module-images";

export const Route = createFileRoute("/modulos/$moduleId")({
  loader: ({ params }) => {
    const m = getModule(params.moduleId);
    if (!m) throw notFound();
    return { id: m.id };
  },
  head: ({ loaderData }) => {
    const m = loaderData ? getModule(loaderData.id) : undefined;
    const title = m ? `${m.title} | Educommerce` : "Módulo | Educommerce";
    const desc = m ? `${m.description} ${m.price ? `Desde ${formatPrice(m.price)} o en el Pack Completo.` : "Incluido en el Pack Completo."}` : "Módulo de Educommerce.";
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
  const m = getModule(id)!;
  const d = moduleDetails[id]!;
  const img = moduleImages[id];
  const combos = m.price ? bundlesFor(id) : [];
  const [learnOpen, setLearnOpen] = useState(0);

  return <>
    <SiteHeader />
    <main className="shell module-page">
      <nav className="module-crumbs" aria-label="Ruta"><Link to="/modulos">Módulos</Link> / <span>{m.title}</span></nav>
      <section className="module-hero">
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
                <Button asChild size="lg" variant="secondary"><Link to="/checkout" search={{ producto: PACK_ID }}>Mejor el Pack Completo</Link></Button>
              </div>
            </div>
          ) : (
            <div className="module-hero-buy module-locked">
              <p><Lock aria-hidden="true" /> Este módulo no se vende por separado: viene incluido en el Pack Completo.</p>
              <Button asChild size="lg"><Link to="/checkout" search={{ producto: PACK_ID }}>Obtener el Pack Completo <ArrowRight aria-hidden="true" /></Link></Button>
            </div>
          )}
        </div>
        {img ? <img className="module-hero-image" src={img} alt={`Ilustración del módulo ${m.title}`} width={1280} height={800} /> : <div className="module-hero-image module-hero-placeholder" aria-label={`Ilustración pendiente: ${m.title}`}><Sparkles aria-hidden="true" /><span>Incluido en el Pack</span></div>}
      </section>

      <section className="module-section module-forwho" aria-labelledby="forwho">
        <h2 id="forwho"><Target aria-hidden="true" /> ¿Es para ti?</h2>
        <ul>{d.forWho.map(f => <li key={f}><Check aria-hidden="true" />{f}</li>)}</ul>
      </section>

      <section className="module-section" aria-labelledby="learn">
        <h2 id="learn"><Wrench aria-hidden="true" /> Lo que vas a dominar</h2>
        <ol className="module-learn">
          {d.learn.map((l, i) => (
            <li key={l}><button type="button" aria-pressed={learnOpen === i} onClick={() => setLearnOpen(i)}><span>{String(i + 1).padStart(2, "0")}</span>{l}</button></li>
          ))}
        </ol>
        <p className="module-learn-note">Paso {learnOpen + 1} de {d.learn.length}: lo practicas en clase y lo aplicas en tu propio proyecto.</p>
      </section>

      <section className="module-section module-project" aria-labelledby="project">
        <h2 id="project"><Hammer aria-hidden="true" /> Terminas con algo hecho</h2>
        <p>{d.project}</p>
      </section>

      {combos.length > 0 && (
        <section className="module-section" aria-labelledby="combos">
          <h2 id="combos"><Gift aria-hidden="true" /> Combínalo y ahorra 20%</h2>
          <div className="combo-grid">
            {combos.map(c => {
              const otherId = c.moduleIds.find(x => x !== id)!;
              const other = getModule(otherId)!;
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

      <PackUpsell />
    </main>
    <SiteFooter />
  </>;
}
