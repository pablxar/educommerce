import { ArrowRight, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { fullProgram, formatPrice, installmentPrice } from "@/lib/educommerce";
import box from "@/assets/program-box.png.asset.json";

export function ProgramOffer() {
  return (
    <article id="pack-completo" className="program-offer" aria-labelledby="offer-title">
      <div className="program-offer-copy">
        <span className="program-offer-badge">Mejor valor</span>
        <h2 id="offer-title">Educommerce Plus</h2>
        <p className="program-offer-description">Los {fullProgram.moduleCount} módulos en un solo programa.<span className="program-offer-description-extra"> Un año de acceso, con opciones de por vida y acompañamiento.</span></p>
      </div>
      <ul className="program-offer-benefits">
        {["Un año de acceso", "De por vida por $20.000 más", "Asesoría y VIP según tu plan", `${fullProgram.installments} cuotas sin interés`].map(item => (
          <li key={item}><span><Check aria-hidden="true" /></span>{item}</li>
        ))}
      </ul>
      <img className="program-offer-image" src={box.url} alt="Caja del programa Educommerce con las herramientas de sus módulos" loading="lazy" width={768} height={768} />
      <div className="program-offer-bottom">
        <p className="program-offer-price"><span><strong>Desde {formatPrice(fullProgram.price)}</strong> <span>Lanzamiento · 1 año · Hasta {fullProgram.installments} × {formatPrice(installmentPrice(fullProgram.price))}</span></span></p>
        <div className="program-offer-action">
          <Button asChild size="lg" className="program-offer-cta"><Link to="/educommerce-plus">Ver Educommerce Plus <ArrowRight aria-hidden="true" /></Link></Button>
          <p>Garantía {fullProgram.guaranteeDays} días o devolución completa</p>
        </div>
      </div>
    </article>
  );
}