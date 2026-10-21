import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const title = "Política de privacidad | Educommerce";
const description = "Cómo Educommerce recopila, usa y protege tus datos personales.";

export const Route = createFileRoute("/privacidad")({
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
  component: Privacidad,
});

function Privacidad() {
  return (
    <LegalPage title="Política de privacidad" updated="11 de octubre de 2026">
      <p>En Educommerce respetamos tu privacidad. Esta política explica qué datos recopilamos, para qué los usamos y qué derechos tienes, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada de Chile y sus modificaciones.</p>
      <h2>1. Datos que recopilamos</h2>
      <ul>
        <li><strong>Newsletter:</strong> tu correo electrónico, nombre si decides indicarlo, fecha y origen de la suscripción. Estos datos se guardan también en el panel privado de Educommerce para gestionar los contactos del newsletter.</li>
        <li><strong>Formulario de contacto:</strong> nombre, correo, asunto y mensaje.</li>
        <li><strong>Cuenta del campus:</strong> nombre, correo, progreso en los módulos y accesos adquiridos.</li>
        <li><strong>Compras:</strong> datos de facturación procesados por el proveedor de pagos; no guardamos datos de tarjetas.</li>
        <li><strong>Carritos y checkout:</strong> al completar nombre y correo guardamos esos datos y el teléfono que indiques, el producto o plan elegido, monto, extras, etapas del pago y fecha, aunque no completes la compra. Estos datos y tus consultas se envían al panel privado del campus para gestionar el seguimiento.</li>
        <li><strong>Actividad comercial:</strong> registramos visitas a productos, extras seleccionados, clics de compra y aperturas de contacto mediante un identificador de sesión. Antes de ingresar tus datos esta actividad no contiene nombre, correo ni teléfono. No grabamos lo que escribes en otros campos ni datos de tarjetas.</li>
        <li><strong>Navegación:</strong> datos técnicos y de uso mediante cookies y píxeles de medición (por ejemplo, Meta y Google).</li>
      </ul>
      <h2>2. Para qué los usamos</h2>
      <ul>
        <li>Darte acceso a los cursos y al campus.</li>
        <li>Responder tus consultas.</li>
        <li>Gestionar compras y consultas, y ayudarte a retomar un checkout no completado; esto no equivale a suscribirte al newsletter ni autoriza por sí solo campañas promocionales.</li>
        <li>Enviarte novedades y contenidos si te suscribiste al newsletter.</li>
        <li>Medir y mejorar el sitio y nuestras campañas publicitarias.</li>
      </ul>
      <h2>3. Cookies y píxeles</h2>
      <p>Usamos cookies propias y de terceros para el funcionamiento del sitio, analítica y publicidad. Puedes bloquearlas o eliminarlas desde la configuración de tu navegador; algunas funciones podrían dejar de funcionar.</p>
      <p>También usamos almacenamiento del navegador para conservar identificadores de sesión y atribución de campañas (UTM, identificadores de clic y página de llegada). No guardamos tu nombre, correo ni teléfono en ese almacenamiento.</p>
      <h2>4. Con quién compartimos datos</h2>
      <p>No vendemos tus datos. Solo los compartimos con proveedores que nos ayudan a operar (alojamiento, base de datos, pagos, email y analítica), bajo obligaciones de confidencialidad, o cuando la ley lo exija.</p>
      <h2>5. Conservación y seguridad</h2>
      <p>Guardamos tus datos mientras mantengas una relación con nosotros o sea necesario para cumplir obligaciones legales. Aplicamos medidas técnicas razonables para protegerlos.</p>
      <h2>6. Tus derechos</h2>
      <p>Puedes solicitar acceso, rectificación, eliminación u oposición al tratamiento de tus datos, y darte de baja del newsletter en cualquier momento. Escríbenos desde la <Link to="/contacto">página de contacto</Link>.</p>
      <h2>7. Menores de edad</h2>
      <p>Nuestros servicios están dirigidos a mayores de 18 años. Los menores deben contar con autorización de su padre, madre o tutor.</p>
      <h2>8. Cambios</h2>
      <p>Podemos actualizar esta política; la versión vigente estará siempre en esta página. Consulta también los <Link to="/terminos">términos y condiciones</Link>.</p>
    </LegalPage>
  );
}
