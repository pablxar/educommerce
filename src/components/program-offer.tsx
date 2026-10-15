import { ArrowRight, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { fullProgram, formatPrice, installmentPrice } from "@/lib/educommerce";
import { PACK_ID } from "@/lib/products";
import box from "@/assets/program-box.png.asset.json";

export function ProgramOffer() {
  return (
    <article id="pack-completo" className="program-offer" aria-labelledby="offer-title">
      <div className="program-offer-copy">
        <span className="program-offer-badge">Mejor valor</span>
        <h2 id="offer-title">Pack Completo Educommerce</h2>
        <p className="program-offer-description">Los {fullProgram.moduleCount} módulos, grupos VIP, mentorías 1 a 1 y acceso de por vida a mejoras y nuevas habilidades.</p>
        <ul className="program-offer-benefits">
          {["Acceso de por vida", "Mentorías 1 a 1", "Grupos VIP de alumnos", `${fullProgram.installments} cuotas sin interés`].map(item => (
            <li key={item}><span><Check aria-hidden="true" /></span>{item}</li>
          ))}
        </ul>
      </div>
      <img className="program-offer-image" src={box.url} alt="Caja del programa Educommerce con las herramientas de sus módulos" loading="lazy" width={768} height={768} />
      <div className="program-offer-bottom">
        <p className="program-offer-price"><del>{formatPrice(fullProgram.originalPrice)}</del><span><strong>{formatPrice(fullProgram.price)}</strong> <span>o {fullProgram.installments} × {formatPrice(installmentPrice(fullProgram.price))}</span></span></p>
        <div className="program-offer-action">
          <Button asChild size="lg" className="program-offer-cta"><Link to="/checkout" search={{ producto: PACK_ID }}>Quiero el Pack Completo <ArrowRight aria-hidden="true" /></Link></Button>
          <p>Garantía {fullProgram.guaranteeDays} días o devolución completa</p>
        </div>
      </div>
    </article>
  );
}