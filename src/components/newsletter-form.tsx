import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().toLowerCase().email().max(255);

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = emailSchema.safeParse(new FormData(form).get("email"));
    if (!parsed.success) return setState("error");
    setState("sending");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data });
    if (error && error.code !== "23505") return setState("error");
    form.reset();
    setState("done");
  }
  return (
    <div className="newsletter">
      <div>
        <h3>Suscríbete al newsletter</h3>
        <p>Novedades, nuevos módulos y consejos prácticos en tu correo.</p>
      </div>
      <form onSubmit={onSubmit} noValidate>
        <input name="email" type="email" placeholder="tu@correo.com" aria-label="Correo electrónico" maxLength={255} required />
        <Button type="submit" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Suscribirme"}</Button>
      </form>
      {state === "done" && <p className="form-success" role="status">¡Listo! Ya estás suscrito.</p>}
      {state === "error" && <p className="form-error" role="alert">Ingresa un correo válido e inténtalo de nuevo.</p>}
    </div>
  );
}
