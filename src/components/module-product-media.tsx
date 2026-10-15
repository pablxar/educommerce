import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModuleMedia } from "@/lib/module-media";

export function ModuleProductMedia({ media, title }: { media?: ModuleMedia | undefined; title: string }) {
  const [selected, setSelected] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const photos = media?.photos ?? [];
  const photo = photos[selected] ?? photos[0];
  const hasVideo = Boolean(media?.video && !videoFailed);
  return <div className="product-media">
    {hasVideo && media?.video ? <figure className="product-preview">
      <video controls preload="none" playsInline poster={media.video.poster ?? photo?.src} aria-label={media.video.title} onError={() => setVideoFailed(true)}>
        <source src={media.video.src} />
        Tu navegador no permite reproducir este video.
      </video>
      <figcaption>{media.video.title}</figcaption>
    </figure> : <figure className="product-preview">
      {photo ? <img src={photo.src} alt={photo.alt} width={1280} height={800} /> : <div className="product-media-empty"><ImageIcon aria-hidden="true" /><span>{title}</span></div>}
      <figcaption>{videoFailed ? "El video no está disponible en este momento." : photo?.caption ?? "Incluido en el Pack Completo"}</figcaption>
    </figure>}
    {photos.length > 1 && <div className="product-photo-picker" role="group" aria-label="Fotos del módulo">
      {photos.map((item, i) => <Button key={`${item.src}-${i}`} variant="ghost" className="product-photo-button" aria-label={`Ver foto ${i + 1}: ${item.alt}`} aria-pressed={selected === i} onClick={() => setSelected(i)}><img src={item.src} alt="" width={160} height={100} /></Button>)}
    </div>}
    {hasVideo && photos.length > 0 && <div className="product-extra-photos">{photos.map((item, i) => <figure key={`${item.src}-${i}`}><img src={item.src} alt={item.alt} width={640} height={400} loading="lazy" />{item.caption && <figcaption>{item.caption}</figcaption>}</figure>)}</div>}
  </div>;
}