import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Img = { src: string; alt: string };
export function PlusGallery({ images }: { images: Img[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = track.current; if (!el) return;
    const on = () => setActive(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  const go = (i: number) => { const el = track.current; if (!el) return; const n = (i + images.length) % images.length; el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" }); };
  return <div className="plus-gallery" role="region" aria-roledescription="carrusel" aria-label="Fotos de Educommerce Plus">
    <div className="plus-gallery-main">
      <div className="plus-gallery-track" ref={track}>
        {images.map((img, i) => <figure key={img.src} aria-label={`${i + 1} de ${images.length}`}><img src={img.src} alt={img.alt} width={1080} height={1080} loading={i ? "lazy" : "eager"} fetchPriority={i ? undefined : "high"} /></figure>)}
      </div>
      <Button variant="outline" size="icon" className="plus-gallery-arrow is-prev" aria-label="Foto anterior" onClick={() => go(active - 1)}><ChevronLeft /></Button>
      <Button variant="outline" size="icon" className="plus-gallery-arrow is-next" aria-label="Foto siguiente" onClick={() => go(active + 1)}><ChevronRight /></Button>
      <span className="plus-gallery-count">{active + 1} / {images.length}</span>
    </div>
    <div className="plus-gallery-thumbs">
      {images.map((img, i) => <button type="button" key={img.src} aria-label={`Ver foto ${i + 1}`} aria-current={active === i ? "true" : undefined} onClick={() => go(i)}><img src={img.src} alt="" width={120} height={120} loading="lazy" /></button>)}
    </div>
  </div>;
}
