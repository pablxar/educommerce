import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Code2, DollarSign, GraduationCap, Image as ImageIcon, LayoutGrid, Megaphone, PenTool, Play, ShoppingBag, TrendingUp, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, filterModules, formatPrice, catalogShowsPack, type Category } from "@/lib/educommerce";
import { moduleImages } from "@/lib/module-images";
import { ProgramSection } from "@/components/program-section";
import { ProgramOffer } from "@/components/program-offer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const categoryIcons: Record<Category, LucideIcon> = {
  Todos: LayoutGrid,
  "E-commerce": ShoppingBag,
  Ads: Megaphone,
  Creatividad: PenTool,
  Web: Code2,
  Negocio: DollarSign,
};

const heroTiles: { Icon: LucideIcon; label: string }[] = [
  { Icon: GraduationCap, label: "Aprende" },
  { Icon: ShoppingBag, label: "Vende" },
  { Icon: TrendingUp, label: "Crece" },
  { Icon: Play, label: "Crea" },
];

const heroBullets = ["Clases prácticas", "Proyectos reales", "Acceso de por vida", "Actualizaciones incluidas"];

export const Route = createFileRoute("/modulos/")({
  head: () => ({ meta: [
    { title: "Módulos | Educommerce" },
    { name: "description", content: "Explora los 10 módulos de Educommerce: e-commerce, publicidad, creatividad, web y negocio. Precios en CLP, combos con 20% y Educommerce Plus desde $199.990." },
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
        <div className="modules-hero-copy">
          <p className="eyebrow">CATÁLOGO DE MÓDULOS</p>
          <h1 id="modules-title">Explora todos los módulos</h1>
          <p className="section-subtitle">Aprende habilidades digitales prácticas y actualizadas para construir, crecer y monetizar tu negocio online.</p>
          <ul className="modules-hero-bullets">{heroBullets.map(b => <li key={b}><CheckCircle2 aria-hidden="true" />{b}</li>)}</ul>
        </div>
        <div className="modules-hero-tiles" aria-hidden="true">{heroTiles.map(({ Icon, label }, i) => <div className="hero-tile" key={label} data-tone={i % 2 === 0 ? "light" : "gray"}><Icon /></div>)}</div>
      </section>
      <section className="catalog" aria-label="Catálogo de módulos">
        <div className="filters" role="group" aria-label="Filtrar módulos por categoría">{categories.map(value => { const Icon = categoryIcons[value]; return <Button key={value} variant="filter" aria-pressed={category === value} onClick={() => setCategory(value)}><Icon aria-hidden="true" />{value}</Button>; })}</div>
        <div className="modules-grid">{visible.map(m => <article className="course-card" key={m.id} aria-label={`Módulo ${m.number}: ${m.title}`}>{moduleImages[m.id] ? <img className="course-thumb" src={moduleImages[m.id]} alt="" width={1280} height={800} loading="lazy" /> : <div className="course-placeholder"><ImageIcon aria-hidden="true" /><span>Incluido en el Pack</span></div>}<div className="course-body"><div className="module-meta"><span className="module-number">{String(m.number).padStart(2, "0")}</span><span className="module-tag">{m.category}</span></div><h3>{m.title}</h3><p className="course-description">{m.description}</p>
<p className="module-price module-price-big">{m.price ? <><span className="price-amount">{formatPrice(m.price)}</span> <span className="price-currency">CLP</span></> : <span className="price-currency">Solo en el Pack Completo</span>}</p><Button asChild className="course-cta">{catalogShowsPack(m.id) ? <Link to="/modulos" hash="pack-completo">Ver Pack Completo <ArrowRight /></Link> : <Link to="/modulos/$moduleId" params={{ moduleId: m.id }}>Ver módulo <ArrowRight /></Link>}</Button></div></article>)}{category === "Todos" && <ProgramOffer />}</div>
      </section>
      {category !== "Todos" && <ProgramSection />}
    </main>
    <SiteFooter />
  </>;
}
