import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/educommerce";
import { plusPlans } from "@/lib/products";

export function PlusPlanOptions({ selectedId }: { selectedId: string }) {
  return <div className="plus-checkout-options" aria-label="Opciones de Educommerce Plus">
    <h2>Elige tu acceso y acompañamiento</h2>
    {plusPlans.map(plan => <Button asChild key={plan.id} variant={selectedId === plan.id ? "default" : "outline"} className="plus-checkout-option">
      <Link to="/checkout" search={{ producto: plan.id }} aria-current={selectedId === plan.id ? "true" : undefined}>
        <span>{plan.name}<small>{plan.access === "one_year" ? "1 año de acceso" : "Acceso de por vida"}{plan.id === "educommerce-plus-asesoria" ? " · Llamada + WhatsApp" : plan.id === "educommerce-plus-vip" ? " · Llamada + WhatsApp + clases + VIP" : ""}</small></span>
        <strong>{formatPrice(plan.price)}</strong>
      </Link>
    </Button>)}
  </div>;
}