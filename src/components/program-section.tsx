import { Link } from "@tanstack/react-router";
import { ProgramOffer } from "@/components/program-offer";

export function ProgramSection() {
  return (
    <section id="programa" className="program-section" aria-label="Educommerce Plus">
      <ProgramOffer />
      <p className="program-alternative">
        ¿Solo necesitas una habilidad?{" "}
        <Link to="/modulos">Explora los módulos disponibles por separado.</Link>
      </p>
    </section>
  );
}
