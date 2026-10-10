import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, GraduationCap } from "lucide-react";
import { destinations } from "@/lib/educommerce";
import { Destination } from "@/components/destination";

export function ProgramSection() {
  return <section id="programa" className="program-section" aria-labelledby="program-title">
    <div className="program-card">
      <div className="program-intro">
        <span className="program-icon">
          <GraduationCap aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">PROGRAMA COMPLETO</p>
          <h2 id="program-title">Todos los módulos de Educommerce</h2>
          <p className="program-desc">
            Acceso completo al programa, con recursos descargables y actualizaciones incluidas.
          </p>
        </div>
      </div>
      <ul className="program-list">
        <li><Check aria-hidden="true" /> Acceso a los 10 módulos</li>
        <li><Check aria-hidden="true" /> Actualizaciones incluidas</li>
        <li><Check aria-hidden="true" /> Recursos descargables en cada cápsula</li>
        <li><Check aria-hidden="true" /> Garantía de 7 días</li>
      </ul>
      <div className="program-purchase">
        <p className="program-price-label">Pago único</p>
        <p className="program-price">$297 USD</p>
        <Destination url={destinations.program} size="lg" className="program-cta" label="Quiero el programa completo">Quiero el programa completo <ArrowRight /></Destination>
        <p className="program-guarantee">Garantía de 20 días o te devolvemos tu dinero.</p>
      </div>
    </div>
    <p className="program-alternative">¿Solo necesitas una habilidad? <Link to="/" hash="cursos">Cada módulo se puede comprar por separado.</Link></p>
  </section>;
}
