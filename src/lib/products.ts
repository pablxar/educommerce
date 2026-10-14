import { fullProgram, modules } from "@/lib/educommerce";

export const BUNDLE_DISCOUNT = 0.2;

/** Two-module combos sold with 20% off. */
export const bundlePairs: [string, string][] = [
  ["shopify", "klaviyo"],
  ["meta", "google"],
  ["guiones", "capcut"],
  ["graficas", "meta"],
  ["lovable", "shopify"],
  ["capcut", "graficas"],
  ["google", "lovable"],
  ["klaviyo", "guiones"],
];

export type Product = { id: string; title: string; price: number; listPrice: number; moduleIds: string[]; kind: "module" | "bundle" | "pack" };

export function isPurchasable(moduleId: string) {
  const m = modules.find(x => x.id === moduleId);
  return !!m && m.price !== null;
}

export function bundleId(a: string, b: string) {
  return `combo-${a}-${b}`;
}

export function bundlePrice(a: string, b: string) {
  const pa = modules.find(m => m.id === a)?.price ?? 0;
  const pb = modules.find(m => m.id === b)?.price ?? 0;
  return Math.round(((pa + pb) * (1 - BUNDLE_DISCOUNT)) / 10) * 10;
}

export function bundlesFor(moduleId: string) {
  return bundlePairs
    .filter(([a, b]) => a === moduleId || b === moduleId)
    .map(([a, b]) => getProduct(bundleId(a, b))!)
    .filter(Boolean);
}

export const PACK_ID = "pack-completo";

export function getProduct(id: string): Product | undefined {
  if (id === PACK_ID) {
    return { id, kind: "pack", title: "Pack Completo Educommerce", price: fullProgram.price, listPrice: fullProgram.originalPrice, moduleIds: modules.map(m => m.id) };
  }
  if (id.startsWith("combo-")) {
    const pair = bundlePairs.find(([a, b]) => bundleId(a, b) === id);
    if (!pair) return undefined;
    const [a, b] = pair;
    const ma = modules.find(m => m.id === a)!;
    const mb = modules.find(m => m.id === b)!;
    return { id, kind: "bundle", title: `Combo ${ma.title} + ${mb.title}`, price: bundlePrice(a, b), listPrice: (ma.price ?? 0) + (mb.price ?? 0), moduleIds: [a, b] };
  }
  const m = modules.find(x => x.id === id);
  if (!m || m.price === null) return undefined;
  return { id, kind: "module", title: m.title, price: m.price, listPrice: m.price, moduleIds: [id] };
}

export const packBenefits = [
  { title: "Todos los módulos", text: "Incluye los que no se venden por separado: Mentalidad emprendedora y Monetiza tus skills." },
  { title: "Grupos VIP", text: "Comunidad privada para resolver dudas y compartir avances con otros alumnos." },
  { title: "Mentorías 1 a 1", text: "Sesiones personales para revisar tu proyecto y destrabar tu próximo paso." },
  { title: "Acceso de por vida", text: "Mejoras de cada módulo y nuevas habilidades que sumemos, sin pagar de nuevo." },
];

export type ModuleDetail = { tagline: string; forWho: string[]; learn: string[]; project: string; tools: string[]; level: string };

export const moduleDetails: Record<string, ModuleDetail> = {
  mentalidad: { tagline: "La base para que todo lo demás funcione.", forWho: ["Quieres emprender y no sabes por dónde partir", "Te cuesta sostener hábitos", "Necesitas claridad antes de invertir"], learn: ["Definir metas realistas y medibles", "Organizar tu semana para avanzar", "Tomar decisiones con información, no con miedo", "Diseñar tu primer plan de acción"], project: "Tu plan de acción de 90 días.", tools: ["Notion", "Google Sheets"], level: "Inicial" },
  shopify: { tagline: "De cero a una tienda lista para vender.", forWho: ["Quieres vender productos online", "Tienes un negocio físico y buscas digitalizarlo", "Ofreces servicios de tiendas a clientes"], learn: ["Configurar Shopify, dominio, pagos y envíos", "Diseñar páginas de producto que convierten", "Personalizar el tema con secciones y Liquid", "Preparar el lanzamiento con un checklist"], project: "Tu tienda publicada con productos, pagos y envíos.", tools: ["Shopify", "Liquid", "Canva"], level: "Inicial a intermedio" },
  meta: { tagline: "Anuncios en Facebook e Instagram que se miden.", forWho: ["Vendes online y necesitas tráfico", "Gestionas redes de clientes", "Quieres dejar de “impulsar” publicaciones a ciegas"], learn: ["Estructurar campañas, conjuntos y anuncios", "Instalar el píxel y medir conversiones", "Crear audiencias y probar creatividades", "Leer métricas y decidir qué escalar"], project: "Una campaña de conversión lista para lanzar.", tools: ["Meta Ads Manager", "Píxel de Meta"], level: "Inicial a intermedio" },
  google: { tagline: "Aparece cuando tu cliente te está buscando.", forWho: ["Tu producto ya tiene búsquedas", "Quieres complementar Meta Ads", "Ofreces gestión de campañas"], learn: ["Investigar palabras clave con intención", "Armar campañas de búsqueda y Performance Max", "Configurar conversiones y etiquetas", "Optimizar costo por resultado"], project: "Una campaña de búsqueda configurada y medida.", tools: ["Google Ads", "Google Tag Manager"], level: "Intermedio" },
  klaviyo: { tagline: "Ventas que llegan mientras duermes.", forWho: ["Ya tienes tienda y suscriptores", "Pierdes carritos abandonados", "Quieres ofrecer email marketing como servicio"], learn: ["Conectar Klaviyo con tu tienda", "Crear flujos de bienvenida y carrito abandonado", "Segmentar listas por comportamiento", "Diseñar campañas que se abren"], project: "Tres flujos automáticos funcionando.", tools: ["Klaviyo", "Shopify"], level: "Intermedio" },
  guiones: { tagline: "Mensajes claros que hacen que te elijan.", forWho: ["Creas contenido o anuncios", "No sabes qué decir en tus videos", "Quieres mejorar tu oferta"], learn: ["Definir tu oferta y a quién le hablas", "Escribir ganchos que detienen el scroll", "Estructurar guiones para anuncios y reels", "Armar un calendario de contenido"], project: "Diez guiones listos para grabar.", tools: ["ChatGPT", "Notion"], level: "Inicial" },
  capcut: { tagline: "Edición que vende y que se cobra bien.", forWho: ["Grabas contenido para tu marca", "Quieres trabajar editando para clientes", "Tus videos no retienen"], learn: ["Ritmo, cortes y subtítulos dinámicos", "Color, sonido y transiciones con intención", "Formatos para anuncios y reels", "Cotizar y presentar proyectos de edición"], project: "Un anuncio editado y tu tarifa de servicio.", tools: ["CapCut"], level: "Inicial a intermedio" },
  graficas: { tagline: "Piezas que se ven bien y convierten.", forWho: ["Necesitas creatividades para anuncios", "Diseñas sin base de diseño", "Quieres ofrecer piezas a clientes"], learn: ["Jerarquía, color y tipografía aplicadas", "Plantillas para anuncios y carruseles", "Adaptar una pieza a todos los formatos", "Probar variantes creativas"], project: "Un set de creatividades para una campaña.", tools: ["Canva"], level: "Inicial" },
  lovable: { tagline: "Tu web profesional, sin escribir código.", forWho: ["Necesitas una web o landing", "Quieres vender sitios a clientes", "Tienes una idea de app"], learn: ["Escribir instrucciones claras para la IA", "Diseñar y estructurar una landing", "Conectar formularios y dominio", "Publicar y medir visitas"], project: "Tu landing publicada con tu dominio.", tools: ["Lovable"], level: "Inicial" },
  monetiza: { tagline: "Convierte lo que sabes en ingresos.", forWho: ["Ya tienes una habilidad digital", "Quieres empezar a cobrar por ella", "Buscas tus primeros clientes"], learn: ["Elegir un servicio rentable", "Poner precio a tu trabajo", "Conseguir y cerrar clientes", "Entregar y pedir recomendaciones"], project: "Tu oferta de servicio con precio y propuesta.", tools: ["Notion", "WhatsApp Business"], level: "Inicial" },
};
