import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, HelpCircle, Home, Mail, MessageCircle, Send, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { submitContact } from "@/lib/contact.functions";
import { supportWhatsAppUrl } from "@/lib/support";
import logo from "@/assets/logo_educommerce.png.asset.json";

const schema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre").max(100),
  email: z.string().trim().email("Escribe un correo válido").max(255),
  message: z.string().trim().min(1, "Escribe tu mensaje").max(2000),
});

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "message" | "help">("home");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const send = useServerFn(submitContact);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa tus datos"); return; }
    setError("");
    setStatus("sending");
    try {
      await send({ data: { ...parsed.data, subject: "Consulta desde el panel de atención" } });
      form.reset();
      setStatus("sent");
    } catch {
      setError("No pudimos guardar tu consulta. Inténtalo nuevamente o escríbenos por WhatsApp.");
      setStatus("idle");
    }
  }

  return (
    <div className="support-widget">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="support-launcher" size="icon" aria-label={open ? "Cerrar atención" : "Abrir atención de Educommerce"} aria-expanded={open} title="Habla con Educommerce">
            {open ? <ChevronDown /> : <MessageCircle />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="support-panel" side="top" align="end" sideOffset={14} collisionPadding={12} aria-label="Atención de Educommerce">
          <header className="support-header">
            <img src={logo.url} alt="Educommerce" />
            <Button variant="ghost" size="icon" className="support-close" onClick={() => setOpen(false)} aria-label="Cerrar panel"><X /></Button>
            <p>Hola, qué gusto verte</p>
            <h2>{view === "message" ? "Cuéntanos tu consulta" : view === "help" ? "Estamos para ayudarte" : "¿Cómo podemos ayudarte?"}</h2>
          </header>
          <div className="support-body">
            {view === "home" && <>
              <Button variant="secondary" className="support-choice" onClick={() => setView("message")}><Mail /><span>Envíanos un mensaje<small>Te responderemos por correo</small></span><ArrowUpRight /></Button>
              <Button asChild variant="secondary" className="support-choice"><a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer"><MessageCircle /><span>Hablar por WhatsApp<small>Conversa con nuestro equipo</small></span><ArrowUpRight /></a></Button>
              <div className="support-note"><span>Aprende. Ejecuta. Monetiza.</span><p>¿Dudas sobre un módulo o tu acceso? Hablemos.</p></div>
            </>}
            {view === "message" && <>
              <Button variant="ghost" size="sm" onClick={() => setView("home")}><ArrowLeft /> Volver</Button>
              {status === "sent" ? <div className="support-success" role="status"><Check /><h3>Recibimos tu consulta</h3><p>Te responderemos al correo que indicaste.</p><Button variant="secondary" onClick={() => setStatus("idle")}>Enviar otra consulta</Button></div> : <form className="support-form" onSubmit={onSubmit} noValidate>
                <label>Tu nombre<input name="name" autoComplete="name" maxLength={100} required /></label>
                <label>Tu correo<input name="email" type="email" autoComplete="email" maxLength={255} required /></label>
                <label>Mensaje<textarea name="message" rows={3} maxLength={2000} required /></label>
                <p className="support-privacy">Consulta nuestra <Link to="/privacidad" onClick={() => setOpen(false)}>política de privacidad</Link>.</p>
                {error && <p role="alert" className="form-error">{error}</p>}
                <Button type="submit" disabled={status === "sending"}><Send />{status === "sending" ? "Enviando…" : "Enviar mensaje"}</Button>
              </form>}
            </>}
            {view === "help" && <div className="support-help"><p>Encuentra respuestas sobre las clases, los módulos y el programa.</p><Button asChild variant="secondary"><Link to="/" hash="preguntas-frecuentes" onClick={() => setOpen(false)}><HelpCircle /> Preguntas frecuentes</Link></Button><Button variant="secondary" onClick={() => setView("message")}><Mail /> Consultar al equipo</Button><Button asChild variant="secondary"><a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp <ArrowUpRight /></a></Button></div>}
          </div>
          <nav className="support-nav" aria-label="Secciones de atención">
            {([{ id: "home", label: "Inicio", Icon: Home }, { id: "message", label: "Mensajes", Icon: MessageCircle }, { id: "help", label: "Ayuda", Icon: HelpCircle }] as const).map(({ id, label, Icon }) => <Button key={id} variant="ghost" aria-pressed={view === id} onClick={() => setView(id)}><Icon /><span>{label}</span></Button>)}
          </nav>
        </PopoverContent>
      </Popover>
    </div>
  );
}