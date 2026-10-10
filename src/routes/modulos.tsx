import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, filterModules, externalUrl, type Category } from "@/lib/educommerce";
import { Destination } from "@/components/destination";
import { ProgramSection } from "@/components/program-section";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/modulos")({
  head: () => ({ meta: [
    { title: "Módulos | Educommerce" },
    { name: "description", content: "Explora los 10 módulos de Educommerce: e-commerce, publicidad, creatividad, web y negocio. Cada habilidad por separado o el programa completo." },
    { property: "og:title", content: "Módulos | Educommerce" },
    { property: "og:description", content: "Explora todos los módulos de Educommerce y elige la habilidad que quieres aprender hoy." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ModulosPage,
});

function ModulosPage() {
  const [category, setCategory] = useState<Category>("Todos");
  const visible = filterModules(category);
  return <>
    <SiteHeader />
    <main className="shell">
      <section className="modules-hero" aria-labelledby="modules-title">
        <p className="eyebrow">CATÁLOGO DE MÓDULOS</p>
        <h1 id="modules-title">Explora todos los módulos</h1>
        <p className="section-subtitle">Aprende habilidades digitales prácticas y actualizadas para construir, crecer y monetizar tu negocio online.</p>
      </section>
      <section className="catalog" aria-label="Catálogo de módulos">
        <div className="filters" role="group" aria-label="Filtrar módulos por categoría">{categories.map(value => <Button key={value} variant="filter" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</Button>)}</div>
        <div className="modules-grid">{visible.map(m => <article className="course-card" key={m.id} aria-label={`Módulo ${m.number}: ${m.title}`}><div className="course-placeholder" aria-label={`Miniatura pendiente: ${m.title}`}><ImageIcon aria-hidden="true" /><span>Miniatura · Módulo {m.number}</span></div><div className="course-body"><div className="module-meta"><span className="module-number">{String(m.number).padStart(2, "0")}</span><span className="module-tag">{m.category}</span></div><h3>{m.title}</h3><p className="course-description">{m.description}</p><Destination url={externalUrl(m.url)} variant="link" className="course-link" label={`Ver módulo ${m.title}`}>Ver módulo <ArrowRight /></Destination></div></article>)}</div>
      </section>
      <ProgramSection />
    </main>
    <SiteFooter />
  </>;
}
