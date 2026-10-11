import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const title = "Términos y condiciones | Educommerce";
const description = "Condiciones de uso del sitio y de los cursos online grabados de Educommerce.";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terminos,
});

function Terminos() {
  return (
    <LegalPage title="Términos y condiciones" updated="11 de octubre de 2026">
      <p>Estos términos regulan el uso del sitio educommerce.cl y la contratación de los cursos online grabados de Educommerce (en adelante, «Educommerce», «nosotros»). Al navegar el sitio o comprar un módulo aceptas estas condiciones.</p>
      <h2>1. Servicio</h2>
      <p>Educommerce ofrece módulos de formación online en habilidades digitales (e-commerce, publicidad, contenido, web y negocio), compuestos por clases grabadas y recursos descargables, a los que se accede a través del campus en app.educommerce.cl.</p>
      <h2>2. Cuenta de acceso</h2>
      <p>Para acceder al contenido debes crear una cuenta con datos verídicos. La cuenta es personal e intransferible: no puedes compartir tus credenciales ni el contenido con terceros. Podemos suspender cuentas que incumplan esta regla.</p>
      <h2>3. Precios y pagos</h2>
      <p>Los precios se muestran en dólares estadounidenses (USD) e incluyen el acceso al módulo o programa indicado. Los pagos se procesan mediante proveedores externos; Educommerce no almacena los datos de tu tarjeta.</p>
      <h2>4. Garantía y retracto</h2>
      <p>El programa completo cuenta con una garantía de 7 días desde la compra. Si no te convence, escríbenos dentro de ese plazo desde la <Link to="/contacto">página de contacto</Link> y gestionaremos la devolución. Lo anterior se entiende sin perjuicio de los derechos que te otorga la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</p>
      <h2>5. Resultados</h2>
      <p>Los cursos entregan conocimientos y herramientas prácticas. Los resultados dependen de la dedicación, el contexto y las decisiones de cada persona; Educommerce no garantiza ingresos, ventas ni resultados económicos específicos.</p>
      <h2>6. Propiedad intelectual</h2>
      <p>Todo el contenido (videos, textos, plantillas, marcas y diseño) pertenece a Educommerce o a sus licenciantes. Se otorga una licencia personal y no exclusiva para uso educativo. Queda prohibido descargar, copiar, revender o redistribuir el material sin autorización escrita.</p>
      <h2>7. Disponibilidad y cambios</h2>
      <p>Procuramos que el campus esté disponible de forma continua, pero pueden existir interrupciones por mantenimiento o causas ajenas. Podemos actualizar los contenidos para mantenerlos vigentes y modificar estos términos; publicaremos la versión vigente en esta página.</p>
      <h2>8. Herramientas de terceros</h2>
      <p>Los módulos enseñan a usar plataformas de terceros (como Shopify, Meta, Google o Klaviyo). Educommerce no está afiliado a ellas ni es responsable de sus cambios, precios o políticas.</p>
      <h2>9. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia se someterá a los tribunales competentes de Chile.</p>
      <h2>10. Contacto</h2>
      <p>Para consultas sobre estos términos, escríbenos desde la <Link to="/contacto">página de contacto</Link>. Revisa también nuestra <Link to="/privacidad">política de privacidad</Link>.</p>
    </LegalPage>
  );
}
