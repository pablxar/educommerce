export const categories = ["Todos", "E-commerce", "Ads", "Creatividad", "Web", "Negocio"] as const;
export type Category = (typeof categories)[number];
export const modules = [
  { id: "mentalidad", price: null, number: 1, category: "Negocio", title: "Intro y mentalidad emprendedora", description: "Desarrolla la mentalidad, claridad y hábitos para emprender con éxito." },
  { id: "shopify", price: 89990, number: 2, category: "E-commerce", title: "Lanza tu e-commerce con Shopify", description: "Crea tu tienda en Shopify desde cero y empieza a vender online." },
  { id: "meta", price: 89990, number: 3, category: "Ads", title: "Meta Ads", description: "Anuncia en Facebook e Instagram para escalar tus ventas." },
  { id: "google", price: 79990, number: 4, category: "Ads", title: "Google Ads", description: "Atrae clientes con campañas que convierten en Google." },
  { id: "klaviyo", price: 69990, number: 5, category: "E-commerce", title: "Email marketing con Klaviyo", description: "Convierte y fideliza clientes con automatizaciones que venden." },
  { id: "guiones", price: 39990, number: 6, category: "Creatividad", title: "Estrategia y guiones", description: "Define tu oferta, mensajes y guiones que convierten." },
  { id: "capcut", price: 49990, number: 7, category: "Creatividad", title: "Edición high-ticket con CapCut", description: "Edita videos que venden y cobra proyectos de alto valor." },
  { id: "graficas", price: 29990, number: 8, category: "Creatividad", title: "Gráficas publicitarias", description: "Diseña creatividades y piezas que convierten." },
  { id: "lovable", price: 49990, number: 9, category: "Web", title: "Crea tu web con IA (Lovable)", description: "Diseña y publica sitios web profesionales sin escribir código." },
] as const;
export function filterModules(category: Category) {
  return modules.filter(m => category === "Todos" || m.category === category);
}
export function catalogShowsPack(moduleId: string) {
  return moduleId === "mentalidad";
}
export function externalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" ? value : undefined; } catch { return undefined; }
}
export const destinations = {
  login: externalUrl(import.meta.env['VITE_LOGIN_URL']),
  academy: externalUrl(import.meta.env['VITE_ACADEMY_URL']),
  contact: externalUrl(import.meta.env['VITE_CONTACT_URL']),
  program: externalUrl(import.meta.env['VITE_PROGRAM_URL']),
};

export const fullProgram = {
  price: 199990,
  originalPrice: 499920,
  installments: 6,
  guaranteeDays: 30,
  moduleCount: 9,
} as const;

export function formatPrice(price: number) {
  return `$${price.toLocaleString("es-CL").replace(/,/g, ".")}`;
}
export function installmentPrice(price: number, installments = 6) {
  return Math.ceil(price / installments);
}
export type ModuleId = (typeof modules)[number]["id"];
export function getModule(id: string) {
  return modules.find(m => m.id === id);
}

export type Capsule = { n: number; title: string; description: string; minutes?: number };
const shopifyCapsules: Capsule[] = [
  { n: 1, title: "Shopify desde cero + configuración inicial", description: "Crea tu cuenta, configura tu tienda y entiende la estructura básica de Shopify.", minutes: 42 },
  { n: 2, title: "Dominio, pagos y envíos", description: "Conecta tu dominio, activa pasarelas de pago y configura envíos.", minutes: 38 },
  { n: 3, title: "Cómo construir una página que venda", description: "Diseña páginas de producto y colecciones optimizadas para convertir.", minutes: 47 },
  { n: 4, title: "Diseño avanzado: CMS + personalización con Liquid", description: "Personaliza tu tema y crea secciones dinámicas con Liquid.", minutes: 51 },
];
export function getCapsules(moduleId: string): Capsule[] {
  if (moduleId === "shopify") return shopifyCapsules;
  return [1, 2, 3, 4].map(n => ({ n, title: `Cápsula ${n}`, description: "Contenido en preparación." }));
}
export function moduleProgress(moduleId: string, completed: number[]) {
  const total = getCapsules(moduleId).length;
  const done = new Set(completed.filter(n => n >= 1 && n <= total)).size;
  return total ? Math.round((done / total) * 100) : 0;
}

export type Resource = { title: string; description: string; format: string; moduleId: string };
export const resources: Resource[] = [
  { title: "Checklist Shopify", description: "Paso a paso para configurar tu tienda antes de lanzar.", format: "PDF", moduleId: "shopify" },
  { title: "Guía de páginas que venden", description: "Estructura y ejemplos de páginas que convierten.", format: "PDF", moduleId: "shopify" },
  { title: "Prompts para Liquid", description: "Prompts listos para personalizar tu tienda con Liquid.", format: "TXT", moduleId: "shopify" },
  { title: "Checklist de lanzamiento", description: "Revisión final antes de publicar tu tienda o campaña.", format: "PDF", moduleId: "shopify" },
  { title: "Plantilla de brief creativo", description: "Estructura para pedir y revisar piezas de anuncio.", format: "PDF", moduleId: "meta" },
  { title: "Guía de investigación de producto", description: "Cómo validar demanda antes de invertir.", format: "PDF", moduleId: "guiones" },
  { title: "Plantilla de guion para anuncios", description: "Gancho, desarrollo y llamada a la acción.", format: "DOCX", moduleId: "guiones" },
  { title: "Flujos de bienvenida", description: "Secuencia base de emails para nuevos suscriptores.", format: "PDF", moduleId: "klaviyo" },
  { title: "Presets de color", description: "Ajustes de color para edición de video.", format: "ZIP", moduleId: "capcut" },
  { title: "Plantilla de presupuesto de edición", description: "Cotiza proyectos de edición de alto valor.", format: "XLSX", moduleId: "capcut" },
];
