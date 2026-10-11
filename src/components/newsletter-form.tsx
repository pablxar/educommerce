import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter, saveNewsletterName } from "@/lib/newsletter.functions";
import { newsletterEmailSchema, newsletterNameSchema } from "@/lib/newsletter-schema";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [nameState, setNameState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const subscribe = useServerFn(subscribeNewsletter);
  const saveName = useServerFn(saveNewsletterName);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = newsletterEmailSchema.safeParse(new FormData(form).get("email"));
    if (!parsed.success) return setState("error");
    setState("sending");
    try {
      const result = await subscribe({ data: { email: parsed.data } });
      setReceipt(result.receipt);
      setNameState("idle");
      form.reset();
      setState("done");
      setOpen(true);
    } catch { setState("error"); }
  }
  async function onNameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = newsletterNameSchema.safeParse(new FormData(e.currentTarget).get("name"));
    if (!parsed.success || !receipt) return setNameState("error");
    setNameState("saving");
    try {
      await saveName({ data: { receipt, name: parsed.data } });
      setReceipt(null);
      setNameState("done");
    } catch { setNameState("error"); }
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
      <p className="newsletter-consent">Al suscribirte aceptas recibir nuestro newsletter. <Link to="/privacidad">Política de privacidad</Link>.</p>
      {state === "done" && <p className="form-success" role="status">¡Listo! Ya estás suscrito.</p>}
      {state === "error" && <p className="form-error" role="alert">Ingresa un correo válido e inténtalo de nuevo.</p>}
      <Dialog.Root open={open} onOpenChange={value => { if (nameState !== "saving") setOpen(value); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="newsletter-dialog-overlay" />
          <Dialog.Content className="newsletter-dialog" onEscapeKeyDown={e => { if (nameState === "saving") e.preventDefault(); }}>
            <Dialog.Close asChild><Button variant="ghost" size="icon" className="newsletter-dialog-close" aria-label="Cerrar" disabled={nameState === "saving"}><X /></Button></Dialog.Close>
            <span className="newsletter-dialog-check"><Check aria-hidden="true" /></span>
            <p className="newsletter-dialog-eyebrow">Ya eres parte</p>
            <Dialog.Title className="newsletter-dialog-title">{nameState === "done" ? "¡Un gusto conocerte!" : "¿Cómo te llamas?"}</Dialog.Title>
            <Dialog.Description className="newsletter-dialog-description">{nameState === "done" ? "Tu nombre quedó guardado junto a tu suscripción." : "Tu correo ya está registrado. Si quieres, cuéntanos tu nombre para conocerte mejor."}</Dialog.Description>
            {nameState === "done" ? <Button size="lg" onClick={() => setOpen(false)}>Listo <Check /></Button> : (
              <form onSubmit={onNameSubmit} className="newsletter-name-form">
                <label htmlFor="newsletter-name">Tu nombre <span>(opcional)</span></label>
                <input id="newsletter-name" name="name" autoComplete="given-name" maxLength={100} placeholder="¿Cómo te gusta que te digan?" disabled={nameState === "saving"} />
                {nameState === "error" && <p className="form-error" role="alert">No pudimos guardar el nombre. Revisa el campo e inténtalo de nuevo.</p>}
                <Button size="lg" type="submit" disabled={nameState === "saving"}>{nameState === "saving" ? "Guardando…" : "Guardar mi nombre"}<ArrowRight /></Button>
                <Button variant="ghost" type="button" disabled={nameState === "saving"} onClick={() => setOpen(false)}>Ahora no</Button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
