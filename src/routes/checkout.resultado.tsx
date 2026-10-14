import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { destinations } from "@/lib/educommerce";
import { getOrderStatus } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/resultado")({
  validateSearch: (s: Record<string, unknown>) => ({
    orden: typeof s["orden"] === "string" ? s["orden"] : "",
    status: typeof s["status"] === "string" ? s["status"] : undefined,
  }),
  head: () => ({ meta: [
    { title: "Estado de tu compra | Educommerce" },
    { name: "description", content: "Revisa el estado de tu pago en Educommerce." },
    { property: "og:title", content: "Estado de tu compra | Educommerce" },
    { property: "og:description", content: "Revisa el estado de tu pago en Educommerce." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ResultPage,
});

function ResultPage() {
  const { orden, status: mpStatus } = Route.useSearch();
  const read = useServerFn(getOrderStatus);
  const [status, setStatus] = useState(mpStatus ?? "pending");
  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(orden)) return;
    let tries = 0;
    const tick = async () => {
      const o = await read({ data: { orderId: orden } }).catch(() => null);
      if (o?.status && o.status !== "pending") { setStatus(o.status); return; }
      if (++tries < 10) timer = setTimeout(tick, 3000);
    };
    let timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [orden, read]);

  const approved = status === "approved";
  const failed = ["rejected", "cancelled", "failure", "null"].includes(status);
  return <>
    <SiteHeader />
    <main className="shell checkout-result">
      {approved ? <>
        <p className="eyebrow">PAGO CONFIRMADO</p>
        <h1>¡Bienvenido a Educommerce!</h1>
        <p>Entra al campus con el mismo correo que usaste al pagar. Si aún no tienes cuenta, créala con ese correo y tu compra aparecerá automáticamente.</p>
        {destinations.login && <Button asChild size="lg"><a href={destinations.login} target="_blank" rel="noopener noreferrer">Ir al campus</a></Button>}
      </> : failed ? <>
        <p className="eyebrow">PAGO NO COMPLETADO</p>
        <h1>Tu pago no se procesó</h1>
        <p>No se realizó ningún cobro. Puedes intentarlo de nuevo con otro medio de pago.</p>
        <Button asChild size="lg"><Link to="/modulos">Volver a los módulos</Link></Button>
      </> : <>
        <p className="eyebrow">PAGO EN PROCESO</p>
        <h1>Estamos confirmando tu pago</h1>
        <p>Mercado Pago está procesando tu compra. El acceso se activará apenas se confirme; puedes dejar esta página abierta.</p>
      </>}
    </main>
    <SiteFooter />
  </>;
}
