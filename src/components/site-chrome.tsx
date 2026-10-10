import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { destinations } from "@/lib/educommerce";
import { Destination } from "@/components/destination";
import logo from "@/assets/logo_educommerce.png.asset.json";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } };
    const closeOutside = (event: PointerEvent) => { if (event.target instanceof Node && !menuRef.current?.contains(event.target) && !menuButton.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape); document.addEventListener("pointerdown", closeOutside);
    return () => { document.removeEventListener("keydown", closeOnEscape); document.removeEventListener("pointerdown", closeOutside); };
  }, [menuOpen]);
  const nav = <><Link to="/modulos" onClick={() => setMenuOpen(false)}>Módulos</Link><Link to="/" hash="academia" onClick={() => setMenuOpen(false)}>Academia</Link><Link to="/" hash="como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</Link></>;
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
  </>;
}

export function SiteFooter() {
  return <footer id="contacto" className="site-footer shell"><div className="footer-brand"><Link to="/" aria-label="Educommerce, inicio"><img src={logo.url} alt="Educommerce" /></Link><p>Habilidades para el mundo digital.</p></div><nav className="footer-links" aria-label="Navegación del pie de página"><Link to="/modulos">Módulos</Link><Link to="/" hash="academia">Academia</Link><Link to="/" hash="contacto">Contacto</Link></nav>{destinations.contact && <a href={destinations.contact} aria-label="Contactar a Educommerce">Contacto</a>}</footer>;
}
