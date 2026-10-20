import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fullProgram, formatPrice, installmentPrice } from "@/lib/educommerce";
import { packBenefits } from "@/lib/products";

export function PackUpsell({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`pack-upsell${compact ? " is-compact" : ""}`} aria-labelledby="pack-upsell-title">
      <div className="pack-upsell-head">
        <span className="pack-upsell-badge"><Crown aria-hidden="true" /> Recomendado · Early adopters</span>
        <h2 id="pack-upsell-title">Conecta tus habilidades con Educommerce Plus</h2>
        <p>Todos los módulos desde {formatPrice(fullProgram.price)} por un año. Elige acceso de por vida y acompañamiento si lo necesitas.</p>
      </div>
      <ul className="pack-upsell-benefits">
        {packBenefits.map(b => <li key={b.title}><strong>{b.title}</strong><span>{b.text}</span></li>)}
      </ul>
      <div className="pack-upsell-buy">
        <p className="pack-upsell-price">Desde <strong>{formatPrice(fullProgram.price)}</strong> · 1 año</p>
        <p className="pack-upsell-installments">o {fullProgram.installments} cuotas sin interés de {formatPrice(installmentPrice(fullProgram.price))}</p>
        <Button asChild size="lg">
          <Link to="/educommerce-plus">Ver Educommerce Plus <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </div>
    </section>
  );
}
