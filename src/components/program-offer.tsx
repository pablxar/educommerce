import { ArrowRight, Check } from "lucide-react";
import { Destination } from "@/components/destination";
import { destinations, fullProgram } from "@/lib/educommerce";
import box from "@/assets/program-box.png.asset.json";

export function ProgramOffer() {
  return (
    <article className="program-offer" aria-labelledby="offer-title">
      <div className="program-offer-copy">
        <span className="program-offer-badge">Mejor valor</span>
        <h2 id="offer-title">Programa Completo Educommerce</h2>
        <p className="program-offer-description">Acceso a los {fullProgram.moduleCount} módulos + actualizaciones + comunidad privada + plantillas y recursos.</p>
        <ul className="program-offer-benefits">
          {["Acceso de por vida", "Actualizaciones incluidas", "Comunidad privada de alumnos", `Garantía ${fullProgram.guaranteeDays} días`].map(item => (
            <li key={item}><span><Check aria-hidden="true" /></span>{item}</li>
          ))}
        </ul>
      </div>
      <img className="program-offer-image" src={box.url} alt="Caja del programa Educommerce con las herramientas de sus módulos" loading="lazy" width={768} height={768} />
      <div className="program-offer-bottom">
        <p className="program-offer-price"><del>${fullProgram.originalPrice} USD</del><span><strong>${fullProgram.price}</strong> <span>USD</span></span></p>
        <div className="program-offer-action">
          <Destination url={destinations.program} size="lg" className="program-offer-cta" label="Quiero el programa completo">Quiero el programa completo <ArrowRight aria-hidden="true" /></Destination>
          <p>Garantía {fullProgram.guaranteeDays} días o devolución completa</p>
        </div>
      </div>
    </article>
  );
}