export const categories = ["Todos", "E-commerce", "Ads", "Creatividad", "Web", "Negocio"] as const;
export type Category = (typeof categories)[number];
export const modules = [
  { id: "mentalidad", number: 1, category: "Negocio", title: "Intro y mentalidad emprendedora", description: "Desarrolla la mentalidad, claridad y hábitos para emprender con éxito.", url: import.meta.env['VITE_MODULE_1_URL'] },
  { id: "shopify", number: 2, category: "E-commerce", title: "Lanza tu e-commerce con Shopify", description: "Crea tu tienda en Shopify desde cero y empieza a vender online.", url: import.meta.env['VITE_MODULE_2_URL'] },
  { id: "meta", number: 3, category: "Ads", title: "Meta Ads", description: "Anuncia en Facebook e Instagram para escalar tus ventas.", url: import.meta.env['VITE_MODULE_3_URL'] },
  { id: "google", number: 4, category: "Ads", title: "Google Ads", description: "Atrae clientes con campañas que convierten en Google.", url: import.meta.env['VITE_MODULE_4_URL'] },
  { id: "klaviyo", number: 5, category: "E-commerce", title: "Email marketing con Klaviyo", description: "Convierte y fideliza clientes con automatizaciones que venden.", url: import.meta.env['VITE_MODULE_5_URL'] },
  { id: "guiones", number: 6, category: "Creatividad", title: "Estrategia y guiones", description: "Define tu oferta, mensajes y guiones que convierten.", url: import.meta.env['VITE_MODULE_6_URL'] },
  { id: "capcut", number: 7, category: "Creatividad", title: "Edición high-ticket con CapCut", description: "Edita videos que venden y cobra proyectos de alto valor.", url: import.meta.env['VITE_MODULE_7_URL'] },
  { id: "graficas", number: 8, category: "Creatividad", title: "Gráficas publicitarias", description: "Diseña creatividades y piezas que convierten.", url: import.meta.env['VITE_MODULE_8_URL'] },
  { id: "lovable", number: 9, category: "Web", title: "Crea tu web con IA (Lovable)", description: "Diseña y publica sitios web profesionales sin escribir código.", url: import.meta.env['VITE_MODULE_9_URL'] },
  { id: "monetiza", number: 10, category: "Negocio", title: "Monetiza tus skills", description: "Convierte tus habilidades en ingresos con negocios digitales.", url: import.meta.env['VITE_MODULE_10_URL'] },
] as const;
export function filterModules(category: Category) {
  return modules.filter(m => category === "Todos" || m.category === category);
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