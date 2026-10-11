import { Link } from "@tanstack/react-router";
import { ProgramOffer } from "@/components/program-offer";

export function ProgramSection() {
  return (
    <section id="programa" className="program-section" aria-label="Programa completo Educommerce">
      <ProgramOffer />
      <p className="program-alternative">
        ¿Solo necesitas una habilidad?{" "}
        <Link to="/" hash="cursos">Cada módulo se puede comprar por separado.</Link>
      </p>
    </section>
  );
}
