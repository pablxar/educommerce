import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Menu, Twitter, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { destinations } from "@/lib/educommerce";
import { useSessionUser } from "@/hooks/use-session-user";
import logo from "@/assets/logo_educommerce.png.asset.json";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSessionUser();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target) &&
        !menuButton.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [menuOpen]);
  const nav = (
    <>
      <Link to="/modulos" onClick={() => setMenuOpen(false)}>
        Módulos
      </Link>
      <Link to="/" hash="academia" onClick={() => setMenuOpen(false)}>
        Academia
      </Link>
      <Link to="/" hash="como-funciona" onClick={() => setMenuOpen(false)}>
        Cómo funciona
      </Link>
    </>
  );
  return (
    <>
      <div className="top-strip">
        <span className="desktop-only">Habilidades digitales para aplicar desde el primer día</span>
        <span className="mobile-only">Aprende a tu ritmo</span>
      </div>
      <header className="shell">
        <div className="site-header">
          <Link to="/" aria-label="Educommerce, inicio">
            <img className="brand-logo" src={logo.url} alt="Educommerce" />
          </Link>
          <nav className="nav-links" aria-label="Navegación principal">
            {nav}
          </nav>
          <div className="header-actions">
            <Button asChild variant="link">
              {user ? <Link to="/campus">Mi campus</Link> : <Link to="/auth">Ingresar</Link>}
            </Button>
            <Button asChild>
              <Link to="/" hash="cursos">
                Explorar módulos
              </Link>
            </Button>
          </div>
          <Button
            ref={menuButton}
            variant="ghost"
            size="icon"
            className="menu-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <div ref={menuRef} id="mobile-navigation">
            <nav className="mobile-menu" aria-label="Navegación móvil">
              {nav}
              <Button asChild variant="link">
                {user ? <Link to="/campus" onClick={() => setMenuOpen(false)}>Mi campus</Link> : <Link to="/auth" onClick={() => setMenuOpen(false)}>Ingresar</Link>}
              </Button>
              <Button asChild>
                <Link to="/" hash="cursos" onClick={() => setMenuOpen(false)}>
                  Explorar módulos
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function FooterPending({ children }: { children: string }) {
  return (
    <span className="footer-pending" title="Página en preparación">
      {children}
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer id="contacto" className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link to="/" aria-label="Educommerce, inicio">
            <img src={logo.url} alt="Educommerce" />
          </Link>
          <p>Aprende. Ejecuta. Monetiza.</p>
        </div>
        <nav className="footer-col" aria-label="Productos">
          <h3>Productos</h3>
          <Link to="/modulos">Todos los módulos</Link>
          <Link to="/" hash="como-funciona">
            Cómo funciona
          </Link>
          <Link to="/" hash="programa">
            Precios
          </Link>
        </nav>
        <nav className="footer-col" aria-label="Empresa">
          <h3>Empresa</h3>
          <Link to="/" hash="quien-te-ensena">
            Acerca de
          </Link>
          <FooterPending>Términos y condiciones</FooterPending>
          <FooterPending>Política de privacidad</FooterPending>
        </nav>
        <nav className="footer-col" aria-label="Recursos">
          <h3>Recursos</h3>
          <FooterPending>Blog</FooterPending>
          {destinations.contact ? (
            <a href={destinations.contact}>Contacto</a>
          ) : (
            <FooterPending>Contacto</FooterPending>
          )}
          <FooterPending>Preguntas frecuentes</FooterPending>
        </nav>
        <div className="footer-col footer-social">
          <h3>Redes sociales</h3>
          <div className="footer-social-icons">
            <span className="footer-icon" title="Instagram · enlace pendiente" aria-label="Instagram, enlace pendiente">
              <Instagram />
            </span>
            <span className="footer-icon" title="YouTube · enlace pendiente" aria-label="YouTube, enlace pendiente">
              <Youtube />
            </span>
            <span className="footer-icon" title="X · enlace pendiente" aria-label="X, enlace pendiente">
              <Twitter />
            </span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="shell footer-bottom-inner">
          <p>© 2026 Educommerce. Todos los derechos reservados.</p>
          <Link to="/modulos">Índice del prototipo</Link>
        </div>
      </div>
    </footer>
  );
}
