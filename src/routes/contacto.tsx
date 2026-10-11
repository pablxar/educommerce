import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader, socialLinks } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";

const title = "Contacto | Educommerce";
const description = "Escríbenos tus dudas sobre los módulos, el campus o tu compra en Educommerce.";

export const Route = createFileRoute("/contacto")({
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
  component: Contacto,
});

const schema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre").max(100),
  email: z.string().trim().email("Correo no válido").max(255),
  subject: z.string().trim().max(150),
  message: z.string().trim().min(1, "Escribe tu mensaje").max(2000),
});

function Contacto() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
    setError("");
    setStatus("sending");
    const { error: dbError } = await supabase.from("contact_submissions").insert({ ...parsed.data, subject: parsed.data.subject || null });
    if (dbError) { setStatus("idle"); return setError("No pudimos enviar tu mensaje. Inténtalo de nuevo."); }
    form.reset();
    setStatus("sent");
  }
  return (
    <>
      <SiteHeader />
      <main className="shell contact-page">
        <div className="contact-intro">
          <h1>Hablemos</h1>
          <p>¿Dudas sobre los módulos, tu acceso o una compra? Escríbenos y te responderemos por correo.</p>
          <div className="contact-social">
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><Instagram /> @educommerce.cl</a>
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"><Youtube /> @educommercecl</a>
          </div>
        </div>
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <label>Nombre<input name="name" maxLength={100} required autoComplete="name" /></label>
          <label>Correo<input name="email" type="email" maxLength={255} required autoComplete="email" /></label>
          <label>Asunto<input name="subject" maxLength={150} /></label>
          <label>Mensaje<textarea name="message" rows={6} maxLength={2000} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {status === "sent" && <p className="form-success" role="status">¡Gracias! Recibimos tu mensaje.</p>}
          <Button type="submit" size="lg" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Enviar mensaje"}</Button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
