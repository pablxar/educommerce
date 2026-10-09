export const categories = ["Todos", "E-commerce", "Marketing", "Contenido"] as const;
export type Category = (typeof categories)[number];
export const courses = [
  { id: "shopify", category: "E-commerce", title: "E-commerce con Shopify", description: "Crea tu tienda online desde cero y empieza a vender tus productos o servicios.", mobileDescription: "Crea tu tienda online paso a paso.", tool: "Shopify", url: import.meta.env['VITE_COURSE_SHOPIFY_URL'] },
  { id: "meta", category: "Marketing", title: "Publicidad con Meta Ads", description: "Llega a más personas y haz crecer tu negocio con campañas efectivas.", tool: "Meta Ads", url: import.meta.env['VITE_COURSE_META_URL'] },
  { id: "klaviyo", category: "Marketing", title: "Email marketing con Klaviyo", description: "Crea audiencias, automatiza tus correos y fortalece la relación con tus clientes.", tool: "Klaviyo", url: import.meta.env['VITE_COURSE_KLAVIYO_URL'] },
  { id: "contenido", category: "Contenido", title: "Contenido que conecta", description: "Aprende a crear contenido auténtico y efectivo para hacer crecer tu marca.", tool: "CapCut", url: import.meta.env['VITE_COURSE_CONTENT_URL'] },
] as const;
export function filterCourses(category: Category) {
  return courses.filter(course => category === "Todos" || course.category === category);
}
export function externalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" ? value : undefined; } catch { return undefined; }
}
export const destinations = {
  login: externalUrl(import.meta.env['VITE_LOGIN_URL']),
  academy: externalUrl(import.meta.env['VITE_ACADEMY_URL']),
  contact: externalUrl(import.meta.env['VITE_CONTACT_URL']),
};