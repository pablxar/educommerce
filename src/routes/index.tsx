import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, GraduationCap, Image as ImageIcon, Menu, X, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, filterCourses, destinations, externalUrl, type Category } from "@/lib/educommerce";
import logo from "@/assets/logo_educommerce.png.asset.json";
import student from "@/assets/student.png.asset.json";
import teacher from "@/assets/teacher-restored.jpg";
import individual from "@/assets/individual.png.asset.json";
import academy from "@/assets/academy.png.asset.json";
import shopify from "@/assets/shopify.svg.asset.json";
import meta from "@/assets/meta.svg.asset.json";
import klaviyo from "@/assets/klaviyo.png.asset.json";
import canva from "@/assets/canva.png.asset.json";
import capcut from "@/assets/capcut.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Educommerce | Aprende habilidades digitales" },
    { name: "description", content: "Cursos online y prácticos de e-commerce, marketing y creación de contenido. Aprende paso a paso, cuando quieras." },
    { property: "og:title", content: "Educommerce | Aprende habilidades digitales" },
    { property: "og:description", content: "Aprende habilidades digitales. Impulsa tus proyectos. Cursos individuales y Academia Educommerce." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Destination({ url, children, variant = "default", className = "", label, onSelect }: { url?: string | undefined; children: React.ReactNode; variant?: "default" | "outline" | "link"; className?: string; label: string; onSelect?: () => void }) {
  const [pending, setPending] = useState(false);
  return <><Button asChild={!!url} variant={variant} className={className} onClick={() => { if (!url) setPending(!pending); onSelect?.(); }} aria-label={url ? undefined : `${label}: enlace pendiente de configurar`}>
    {url ? <a href={url}>{children}</a> : children}
  </Button>{pending && <p className="pending-notice" role="status">Enlace pendiente de configurar.</p>}</>;
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("Todos");
  const [activeSlide, setActiveSlide] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const visibleCourses = filterCourses(category);
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } };
    const closeOutside = (event: PointerEvent) => { if (event.target instanceof Node && !menuRef.current?.contains(event.target) && !menuButton.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape); document.addEventListener("pointerdown", closeOutside);
    return () => { document.removeEventListener("keydown", closeOnEscape); document.removeEventListener("pointerdown", closeOutside); };
  }, [menuOpen]);
  function selectCategory(value: Category) { setCategory(value); setActiveSlide(0); trackRef.current?.scrollTo({ left: 0, behavior: "instant" }); }
  function goToSlide(index: number) { const track = trackRef.current; const card = track?.children.item(index); if (track && card instanceof HTMLElement) { const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; track.scrollTo({ left: card.offsetLeft - (track.children.item(0) as HTMLElement).offsetLeft, behavior: reduced ? "instant" : "smooth" }); setActiveSlide(index); } }
  function updateSlide() { const track = trackRef.current; const card = track?.children.item(0); if (!track || !(card instanceof HTMLElement)) return; setActiveSlide(Math.min(visibleCourses.length - 1, Math.round(track.scrollLeft / (card.offsetWidth + 14)))); }
  const nav = <><Link to="/" hash="cursos" onClick={() => setMenuOpen(false)}>Cursos</Link><Link to="/" hash="academia" onClick={() => setMenuOpen(false)}>Academia</Link><Link to="/" hash="como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</Link></>;
  return <>
    <div className="top-strip"><span className="desktop-only">Habilidades digitales para aplicar desde el primer día</span><span className="mobile-only">Aprende a tu ritmo</span></div>
    <header className="shell">
      <div className="site-header">
        <Link to="/" aria-label="Educommerce, inicio"><img className="brand-logo" src={logo.url} alt="Educommerce" /></Link>
        <nav className="nav-links" aria-label="Navegación principal">{nav}</nav>
        <div className="header-actions"><Destination url={destinations.login} variant="link" label="Ingresar">Ingresar</Destination><Button asChild><Link to="/" hash="cursos">Explorar cursos</Link></Button></div>
        <Button ref={menuButton} variant="ghost" size="icon" className="menu-toggle" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && <div ref={menuRef} id="mobile-navigation"><nav className="mobile-menu" aria-label="Navegación móvil">{nav}<Destination url={destinations.login} variant="link" label="Ingresar" onSelect={() => setMenuOpen(false)}>Ingresar</Destination><Button asChild><Link to="/" hash="cursos" onClick={() => setMenuOpen(false)}>Explorar cursos</Link></Button></nav></div>}
    </header>
    <main className="shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="desktop-only">APRENDE A TU RITMO</span><span className="mobile-only">100% ONLINE · CLASES GRABADAS</span></div>
          <h1 id="hero-title"><span>Aprende</span><span className="green-text">habilidades digitales.</span><span>Impulsa tus</span><span>proyectos.</span></h1>
          <p className="hero-description"><span className="desktop-only">Cursos online y prácticos de e-commerce, marketing y creación de contenido. Aprende paso a paso, cuando quieras.</span><span className="mobile-only">Cursos prácticos de e-commerce, marketing y contenido. Aprende paso a paso, cuando quieras.</span></p>
          <div className="hero-actions"><Button size="lg" asChild><Link to="/" hash="cursos">Explorar cursos <ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><Link to="/" hash="academia">Conocer la academia <ArrowRight className="mobile-only" /></Link></Button></div>
          <p className="support-line">100% online · Clases grabadas · Enfoque práctico</p>
        </div>
        <div className="hero-visual">
          <div className="main-photo"><div className="photo-caption"><Clapperboard aria-hidden="true" />De la idea a la práctica</div><img src={student.url} alt="Alumna estudiando frente a su computador" /></div>
          <img className="side-student" src={individual.url} alt="Alumno trabajando en su portátil" />
          <div className="class-preview" role="img" aria-label="Vista previa de una clase grabada: Crea tu tienda en Shopify"><img className="teacher-photo" src={teacher} alt="Docente explicando una clase grabada" /><div className="class-syllabus"><h3>Crea tu tienda en Shopify</h3><ol><li>1. Introducción</li><li>2. Configuración de tienda</li><li>3. Productos y colecciones</li><li>4. Medios de pago</li><li>5. Lanzamiento</li></ol></div></div>
        </div>
      </section>
      <section className="tools-band" aria-label="Herramientas de aprendizaje"><p className="tools-intro">Aprende a trabajar con herramientas como:</p><div className="tools-list"><div className="tool"><img className="tool-icon" src={shopify.url} alt="" />Shopify</div><div className="tool"><img className="tool-icon" src={meta.url} alt="" />Meta Ads</div><img className="tool-logo" src={klaviyo.url} alt="Klaviyo" /><img className="tool-logo" src={canva.url} alt="Canva" /><img className="tool-logo" src={capcut.url} alt="CapCut" /></div></section>
      <section id="cursos" className="catalog" aria-labelledby="catalog-title">
        <h2 id="catalog-title" className="section-heading">¿Qué quieres aprender hoy?</h2><p className="section-subtitle">Elige una habilidad y comienza a construir.</p>
        <div className="filters" role="group" aria-label="Filtrar cursos por categoría">{categories.map(value => <Button key={value} variant="filter" aria-pressed={category === value} onClick={() => selectCategory(value)}>{value}</Button>)}</div>
        <div className="course-track" ref={trackRef} onScroll={updateSlide} aria-label="Cursos disponibles">{visibleCourses.map(course => <article className="course-card" key={course.id}><div className="course-placeholder" aria-label={`Miniatura pendiente: ${course.title}`}><ImageIcon aria-hidden="true" /><span>Miniatura · {course.tool}</span></div><div className="course-body"><span className="course-label">CURSO ONLINE</span><h3>{course.title}</h3><p className="course-description">{"mobileDescription" in course ? <><span className="desktop-only">{course.description}</span><span className="mobile-only">{course.mobileDescription}</span></> : course.description}</p><Destination url={externalUrl(course.url)} variant="link" className="course-link" label={`Ver curso ${course.title}`}>Ver curso <ArrowUpRight /></Destination></div></article>)}</div>
        <div className="carousel-dots" aria-label="Elegir tarjeta del carrusel">{visibleCourses.map((course,index) => <Button key={course.id} variant="ghost" size="icon" className="carousel-dot" aria-label={`Mostrar ${course.title}`} aria-current={activeSlide === index} onClick={() => goToSlide(index)}><span /></Button>)}</div>
      </section>
      <section className="next-step" aria-labelledby="next-title"><h2 id="next-title" className="section-heading">Tu próximo paso empieza aquí</h2><div className="path-grid">
        <article className="path-card"><div className="path-copy"><BookOpen aria-hidden="true" /><div className="path-intro desktop-only">Una habilidad, un nuevo comienzo</div><h3>Cursos individuales</h3><p><span className="desktop-only">Profundiza en lo que necesitas y avanza a tu ritmo.</span><span className="mobile-only">Profundiza en la habilidad que necesitas.</span></p><Button variant="outline" asChild><Link to="/" hash="cursos">Ver cursos</Link></Button></div><img className="path-image" src={individual.url} alt="Alumno aprendiendo a su ritmo" /></article>
        <article id="academia" className="path-card academy-card"><div className="path-copy"><div className="eyebrow desktop-only">FORMACIÓN INTEGRAL</div><GraduationCap className="mobile-only" aria-hidden="true" /><h3>Academia Educommerce</h3><p><span className="desktop-only">Conecta las habilidades para crear y potenciar tu negocio digital.</span><span className="mobile-only">Conecta las habilidades para potenciar tu negocio digital.</span></p><Destination url={destinations.academy} label="Conocer la academia">Conocer la academia <ArrowRight /></Destination></div><img className="path-image" src={academy.url} alt="Alumna de la Academia Educommerce" /></article>
      </div></section>
      <section id="como-funciona" className="steps-section" aria-labelledby="steps-title"><h2 className="section-heading" id="steps-title">Aprende. Practica. Aplica.</h2><div className="steps-grid">{[
        ["01", "Elige tu camino", "Encuentra la habilidad que quieres desarrollar."],
        ["02", "Aprende a tu ritmo", "Clases grabadas, claras y paso a paso."],
        ["03", "Llévalo a la práctica", "Aplica lo aprendido a tus proyectos."],
      ].map(([number,title,description]) => <div className="step" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div></section>
      <section className="final-panel"><div><h2>El siguiente paso lo das tú.</h2><p>Empieza a desarrollar tus habilidades digitales hoy.</p></div><Button variant="inverse" size="lg" asChild><Link to="/" hash="cursos">Explorar cursos <ArrowRight /></Link></Button></section>
    </main>
    <footer id="contacto" className="site-footer shell"><div className="footer-brand"><Link to="/" aria-label="Educommerce, inicio"><img src={logo.url} alt="Educommerce" /></Link><p>Habilidades para el mundo digital.</p></div><nav className="footer-links" aria-label="Navegación del pie de página"><Link to="/" hash="cursos">Cursos</Link><Link to="/" hash="academia">Academia</Link><Link to="/" hash="contacto">Contacto</Link></nav>{destinations.contact && <a href={destinations.contact} aria-label="Contactar a Educommerce">Contacto</a>}</footer>
  </>;
}
