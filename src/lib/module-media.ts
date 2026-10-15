import { moduleImages } from "@/lib/module-images";

export type ProductPhoto = { src: string; alt: string; caption?: string };
export type ModuleMedia = { video?: { src: string; poster?: string; title: string }; photos: ProductPhoto[] };

// Add a hosted MP4/WebM preview and real product photos here for each module.
// Empty video values intentionally render no playback controls.
export const moduleMedia: Record<string, ModuleMedia> = Object.fromEntries(
  Object.entries(moduleImages).map(([id, src]) => [id, {
    photos: src ? [{ src, alt: `Imagen de muestra del módulo ${id}`, caption: "Imagen de muestra" }] : [],
  }]),
);