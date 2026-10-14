import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fullProgram, formatPrice, installmentPrice } from "@/lib/educommerce";
import { PACK_ID, packBenefits } from "@/lib/products";

export function PackUpsell({ compact = false }: { compact?: boolean }) {
  const saving = fullProgram.originalPrice - fullProgram.price;
  return (
    <section className={`pack-upsell${compact ? " is-compact" : ""}`} aria-labelledby="pack-upsell-title">
      <div className="pack-upsell-head">
        <span className="pack-upsell-badge"><Crown aria-hidden="true" /> Recomendado · Early adopters</span>
        <h2 id="pack-upsell-title">Mejor llévate el Pack Completo</h2>
        <p>Todos los módulos por menos de lo que cuestan tres por separado. Ahorras {formatPrice(saving)}.</p>
      </div>
      <ul className="pack-upsell-benefits">
        {packBenefits.map(b => <li key={b.title}><strong>{b.title}</strong><span>{b.text}</span></li>)}
      </ul>
      <div className="pack-upsell-buy">
        <p className="pack-upsell-price"><del>{formatPrice(fullProgram.originalPrice)}</del> <strong>{formatPrice(fullProgram.price)}</strong></p>
        <p className="pack-upsell-installments">o {fullProgram.installments} cuotas sin interés de {formatPrice(installmentPrice(fullProgram.price))}</p>
        <Button asChild size="lg">
          <Link to="/checkout" search={{ producto: PACK_ID }}>Quiero el Pack Completo <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </div>
    </section>
  );
}
