import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Destination({ url, children, variant = "default", size, className = "", label, onSelect }: { url?: string | undefined; children: React.ReactNode; variant?: "default" | "outline" | "link"; size?: "default" | "sm" | "lg"; className?: string; label: string; onSelect?: () => void }) {
  const [pending, setPending] = useState(false);
  return <><Button asChild={!!url} variant={variant} size={size} className={className} onClick={() => { if (!url) setPending(!pending); onSelect?.(); }} aria-label={url ? undefined : `${label}: enlace pendiente de configurar`}>
    {url ? <a href={url}>{children}</a> : children}
  </Button>{pending && <p className="pending-notice" role="status">Enlace pendiente de configurar.</p>}</>;
}
