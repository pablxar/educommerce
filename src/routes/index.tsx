import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Image as ImageIcon,
  Clapperboard,
  Hammer,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, filterModules, destinations, type Category , formatPrice } from "@/lib/educommerce";
import { Destination } from "@/components/destination";
import { FaqSection } from "@/components/faq-section";
import { ProgramSection } from "@/components/program-section";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import student from "@/assets/student.png.asset.json";
import teacher from "@/assets/teacher-restored.jpg";
import founders from "@/assets/founders.jpg.asset.json";
import individual from "@/assets/individual.png.asset.json";
import academy from "@/assets/academy.png.asset.json";
import shopify from "@/assets/shopify-wordmark.png.asset.json";
import meta from "@/assets/meta-wordmark.png.asset.json";
import klaviyo from "@/assets/klaviyo-wordmark.png.asset.json";
import canva from "@/assets/canva-wordmark.png.asset.json";
import capcut from "@/assets/capcut-wordmark.png.asset.json";
import googleads from "@/assets/googleads-wordmark.png.asset.json";
import lovableLogo from "@/assets/lovable-wordmark.png.asset.json";
import manychat from "@/assets/manychat-wordmark.png.asset.json";

const toolLogos = [
  { src: shopify.url, alt: "Shopify", cls: "tool-shopify" },
  { src: meta.url, alt: "Meta Ads", cls: "tool-meta" },
  { src: klaviyo.url, alt: "Klaviyo", cls: "tool-klaviyo" },
  { src: canva.url, alt: "Canva", cls: "tool-canva" },
  { src: capcut.url, alt: "CapCut", cls: "tool-capcut" },
  { src: googleads.url, alt: "Google Ads", cls: "tool-googleads" },
  { src: lovableLogo.url, alt: "Lovable", cls: "tool-lovable" },
  { src: manychat.url, alt: "ManyChat", cls: "tool-manychat" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Educommerce | Aprende habilidades digitales" },
      {
        name: "description",
        content:
          "Cursos online y prácticos de e-commerce, marketing y creación de contenido. Aprende paso a paso, cuando quieras.",
      },
      { property: "og:title", content: "Educommerce | Aprende habilidades digitales" },
      {
        property: "og:description",
        content: "Aprende habilidades digitales. Impulsa tus proyectos. Módulos individuales y Academia Educommerce.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [category, setCategory] = useState<Category>("Todos");
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const visibleCourses = filterModules(category);
  const [edges, setEdges] = useState({ start: true, end: false });
  function selectCategory(value: Category) {
    setCategory(value);
    setActiveSlide(0);
    trackRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }
  function goToSlide(index: number) {
    const track = trackRef.current;
    const card = track?.children.item(index);
    if (track && card instanceof HTMLElement) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({
        left: card.offsetLeft - (track.children.item(0) as HTMLElement).offsetLeft,
        behavior: reduced ? "instant" : "smooth",
      });
      setActiveSlide(index);
    }
  }
  function slideStep() {
    const track = trackRef.current;
    const a = track?.children.item(0),
      b = track?.children.item(1);
    if (!(a instanceof HTMLElement)) return 1;
    return b instanceof HTMLElement ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
  }
  function updateSlide() {
    const track = trackRef.current;
    if (!track) return;
    setActiveSlide(Math.min(visibleCourses.length - 1, Math.round(track.scrollLeft / slideStep())));
    setEdges({ start: track.scrollLeft <= 2, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
  }
  function scrollByCards(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * slideStep(), behavior: reduced ? "instant" : "smooth" });
  }
  useEffect(() => {
    updateSlide();
  }, [category]);
  return (
    <>
      <SiteHeader />
      <main className="shell homepage">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">

            <h1 id="hero-title">
              <span>Aprende</span>
              <span className="green-text hero-underline desktop-only">
                habilidades digitales.
                <svg className="underline-swoosh" viewBox="0 0 220 30" preserveAspectRatio="none" aria-hidden="true">
                  <path className="swoosh-main" d="M3 20 C 45 26, 80 25, 100 16 C 108 11, 116 10, 118 14 C 120 18, 114 21, 108 19 C 104 17.5, 104 13, 108 11 C 130 2, 185 8, 217 13" pathLength="1" fill="none" strokeLinecap="round" />
                  <path className="swoosh-soft" d="M10 25 C 60 30, 150 26, 205 17" pathLength="1" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <span className="green-text mobile-only">habilidades</span>
              <span className="green-text hero-underline mobile-only">
                digitales.
                <svg className="underline-swoosh" viewBox="0 0 220 30" preserveAspectRatio="none" aria-hidden="true">
                  <path className="swoosh-main" d="M3 20 C 45 26, 80 25, 100 16 C 108 11, 116 10, 118 14 C 120 18, 114 21, 108 19 C 104 17.5, 104 13, 108 11 C 130 2, 185 8, 217 13" pathLength="1" fill="none" strokeLinecap="round" />
                  <path className="swoosh-soft" d="M10 25 C 60 30, 150 26, 205 17" pathLength="1" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <span>Impulsa tus</span>
              <span>proyectos.</span>
            </h1>
            <p className="hero-description">
              <span className="desktop-only">
                Cursos online y prácticos de e-commerce, marketing y creación de contenido. Aprende paso a paso, cuando
                quieras.
              </span>
              <span className="mobile-only">
                Cursos prácticos de e-commerce, marketing y contenido. Aprende paso a paso, cuando quieras.
              </span>
            </p>
            <div className="hero-actions">
              <Button size="lg" asChild>
                <Link to="/" hash="cursos">
                  Explorar módulos <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/" hash="academia">
                  Conocer la academia <ArrowRight className="mobile-only" />
                </Link>
              </Button>
            </div>
            <p className="support-line">100% online · Clases grabadas · Enfoque práctico</p>
          </div>
          <div className="hero-visual">
            <div className="main-photo">
              <div className="photo-caption">
                <Clapperboard aria-hidden="true" />
                De la idea a la práctica
              </div>
              <img src={student.url} alt="Alumna estudiando frente a su computador" />
            </div>
            <img className="side-student" src={individual.url} alt="Alumno trabajando en su portátil" />
            <div
              className="class-preview"
              role="img"
              aria-label="Vista previa de una clase grabada: Crea tu tienda en Shopify"
            >
              <img className="teacher-photo" src={teacher} alt="Docente explicando una clase grabada" />
              <div className="class-syllabus">
                <h3>Crea tu tienda en Shopify</h3>
                <ol>
                  <li>1. Introducción</li>
                  <li>2. Configuración de tienda</li>
                  <li>3. Productos y colecciones</li>
                  <li>4. Medios de pago</li>
                  <li>5. Lanzamiento</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="tools-band" aria-label="Herramientas de aprendizaje">
          <p className="tools-intro">Aprende a trabajar con herramientas como:</p>
          <div className="tools-marquee">
            <div className="tools-track">
              {toolLogos.map((tool, index) => (
                <img key={index} src={tool.src} alt={tool.alt} className={tool.cls} />
              ))}
              {toolLogos.map((tool, index) => (
                <img key={`dup-${index}`} src={tool.src} alt="" aria-hidden="true" className={tool.cls} />
              ))}
            </div>
          </div>
        </section>
        <section className="value-props" aria-label="Aprende, ejecuta y monetiza">
          <div className="value-grid">
            <article className="value-card" tabIndex={0}>
              <div className="value-stage value-stage-learn" aria-hidden="true">
                <div className="vp-window">
                  <div className="vp-head">
                    <span className="vp-head-icon"><BookOpen /></span>
                    <span className="vp-head-text"><strong>Módulo 2</strong><small>Shopify</small></span>
                    <span className="vp-pill">En curso</span>
                  </div>
                  <ul className="vp-list">
                    <li className="is-done"><span className="vp-dot" />Configura tu tienda<em>listo</em></li>
                    <li className="is-done"><span className="vp-dot" />Sube tus productos<em>listo</em></li>
                    <li><span className="vp-dot" />Diseña tu portada<em>ahora</em></li>
                  </ul>
                  <div className="vp-progress"><span /></div>
                </div>
              </div>
              <p className="value-eyebrow">01 · Aprende</p>
              <h3>Domina las herramientas</h3>
              <p>Clases cortas y prácticas para dominar las herramientas que hoy se usan para vender online.</p>
            </article>
            <article className="value-card" tabIndex={0}>
              <div className="value-stage value-stage-build" aria-hidden="true">
                <div className="vp-window">
                  <div className="vp-head">
                    <span className="vp-head-icon"><Hammer /></span>
                    <span className="vp-head-text"><strong>Tu entrega</strong><small>Cápsula 4</small></span>
                    <span className="vp-pill">Creando</span>
                  </div>
                  <div className="vp-tasks">
                    <span className="vp-task"><Clapperboard />Pieza de video</span>
                    <span className="vp-task"><ImageIcon />Gráfica de anuncio</span>
                    <span className="vp-task"><GraduationCap />Página de producto</span>
                  </div>
                  <p className="vp-foot"><span className="vp-dot is-live" />Algo hecho en cada cápsula</p>
                </div>
              </div>
              <p className="value-eyebrow">02 · Ejecuta</p>
              <h3>Termina con algo hecho</h3>
              <p>Cada cápsula termina con algo hecho: una pieza, una campaña, una página.</p>
            </article>
            <article className="value-card" tabIndex={0}>
              <div className="value-stage value-stage-earn" aria-hidden="true">
                <div className="vp-window">
                  <div className="vp-head">
                    <span className="vp-head-icon"><TrendingUp /></span>
                    <span className="vp-head-text"><strong>Tus habilidades</strong><small>Aplicadas</small></span>
                  </div>
                  <div className="vp-bars">
                    {[38, 52, 46, 68, 80, 96].map((h, i) => (
                      <span key={i} style={{ ["--h" as string]: `${h}%`, ["--i" as string]: i }} />
                    ))}
                  </div>
                  <div className="vp-split">
                    <span><small>Uso</small>Tu negocio</span>
                    <span><small>O bien</small>Como servicio</span>
                  </div>
                </div>
              </div>
              <p className="value-eyebrow">03 · Monetiza</p>
              <h3>Ponlo a trabajar</h3>
              <p>Aplícalo en tu negocio o véndelo como servicio.</p>
            </article>
          </div>
        </section>
        <section id="cursos" className="catalog" aria-labelledby="catalog-title">
          <div className="catalog-head">
            <div>
              <h2 id="catalog-title" className="section-heading">
                ¿Qué quieres aprender hoy?
              </h2>
              <p className="section-subtitle">Elige una habilidad y comienza a construir.</p>
            </div>
            <div className="carousel-arrows">
              <Button
                variant="outline"
                size="icon"
                aria-label="Módulo anterior"
                aria-controls="module-track"
                disabled={edges.start}
                onClick={() => scrollByCards(-1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Módulo siguiente"
                aria-controls="module-track"
                disabled={edges.end}
                onClick={() => scrollByCards(1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
          <div className="filters" role="group" aria-label="Filtrar módulos por categoría">
            {categories.map((value) => (
              <Button
                key={value}
                variant="filter"
                aria-pressed={category === value}
                onClick={() => selectCategory(value)}
              >
                {value}
              </Button>
            ))}
          </div>
          <div
            className="course-track"
            id="module-track"
            ref={trackRef}
            onScroll={updateSlide}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Módulos del programa"
            tabIndex={0}
          >
            {visibleCourses.map((m) => (
              <article className="course-card" key={m.id} aria-label={`Módulo ${m.number}: ${m.title}`}>
                <div className="course-placeholder" aria-label={`Miniatura pendiente: ${m.title}`}>
                  <ImageIcon aria-hidden="true" />
                  <span>Miniatura · Módulo {m.number}</span>
                </div>
                <div className="course-body">
                  <div className="module-meta">
                    <span className="module-number">{String(m.number).padStart(2, "0")}</span>
                    <span className="module-tag">{m.category}</span>
                  </div>
                  <h3>{m.title}</h3>
                  <p className="course-description">{m.description}</p>
<p className="module-price">{formatPrice(m.price)}</p>
                  <Button variant="default" asChild className="course-link course-cta">
                    <Link to="/modulos" aria-label={`Ver módulo ${m.title}`}>
                      Ver módulo <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="carousel-dots" aria-label="Elegir tarjeta del carrusel">
            {visibleCourses.map((course, index) => (
              <Button
                key={course.id}
                variant="ghost"
                size="icon"
                className="carousel-dot"
                aria-label={`Mostrar ${course.title}`}
                aria-current={activeSlide === index}
                onClick={() => goToSlide(index)}
              >
                <span />
              </Button>
            ))}
          </div>
        </section>
        <section className="next-step" aria-labelledby="next-title">
          <h2 id="next-title" className="section-heading">
            Tu próximo paso empieza aquí
          </h2>
          <div className="path-grid">
            <article className="path-card">
              <div className="path-copy">
                <BookOpen aria-hidden="true" />
                <div className="path-intro desktop-only">Una habilidad, un nuevo comienzo</div>
                <h3>Cursos individuales</h3>
                <p>
                  <span className="desktop-only">Profundiza en lo que necesitas y avanza a tu ritmo.</span>
                  <span className="mobile-only">Profundiza en la habilidad que necesitas.</span>
                </p>
                <Button variant="outline" asChild>
                  <Link to="/" hash="cursos">
                    Ver cursos
                  </Link>
                </Button>
              </div>
              <img className="path-image" src={individual.url} alt="Alumno aprendiendo a su ritmo" />
            </article>
            <article id="academia" className="path-card academy-card">
              <div className="path-copy">
                <div className="eyebrow desktop-only">FORMACIÓN INTEGRAL</div>
                <GraduationCap className="mobile-only" aria-hidden="true" />
                <h3>Academia Educommerce</h3>
                <p>
                  <span className="desktop-only">
                    Conecta las habilidades para crear y potenciar tu negocio digital.
                  </span>
                  <span className="mobile-only">Conecta las habilidades para potenciar tu negocio digital.</span>
                </p>
                <Destination url={destinations.academy} label="Conocer la academia">
                  Conocer la academia <ArrowRight />
                </Destination>
              </div>
              <img className="path-image" src={academy.url} alt="Alumna de la Academia Educommerce" />
            </article>
          </div>
        </section>
        <section id="como-funciona" className="steps-section" aria-labelledby="steps-title">
          <div className="steps-head">
            <div className="eyebrow">ASÍ FUNCIONA</div>
            <h2 className="section-heading" id="steps-title">
              Aprende. Practica. Aplica.
            </h2>
            <p className="section-subtitle">El camino corto desde la idea hasta un resultado real.</p>
          </div>
          <div className="steps-grid">
            {[
              ["01", "Elige tu camino", "Encuentra la habilidad que quieres desarrollar."],
              ["02", "Aprende a tu ritmo", "Clases grabadas, claras y paso a paso."],
              ["03", "Llévalo a la práctica", "Aplica lo aprendido a tus proyectos."],
            ].map(([number, title, description]) => (
              <div className="step" key={number}>
                <span className="step-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section id="quien-te-ensena" className="teacher-section" aria-labelledby="teacher-title">
          <h2 id="teacher-title" className="section-heading">
            Quién te enseña
          </h2>
          <div className="teacher-card">
            <div className="teacher-photo-frame">
              <img
                src={founders.url}
                alt="Benjamín, Pablo y Martín, docentes de Educommerce, trabajando en sus laptops"
              />
            </div>
            <div className="teacher-copy">
              <h3>Benjamín, Pablo y Martín</h3>
              <p className="teacher-role">Docentes y fundadores de Educommerce</p>
              <p className="teacher-bio">
                Enseñamos esto porque lo vivimos todos los días: creamos tiendas, campañas y contenido para nuestros
                propios proyectos, y cada clase nace de esos aciertos y errores reales. Queremos que aprendas paso a
                paso, sin rodeos, y que lo apliques desde el primer día.
              </p>
            </div>
          </div>
        </section>
        <ProgramSection />
        <FaqSection />
        <section className="final-panel">
          <div>
            <h2>El siguiente paso lo das tú.</h2>
            <p>Empieza a desarrollar tus habilidades digitales hoy.</p>
          </div>
          <Button variant="inverse" size="lg" asChild>
            <Link to="/" hash="cursos">
              Explorar cursos <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
