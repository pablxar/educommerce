import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Nueva contraseña | Educommerce" },
    { name: "description", content: "Crea una nueva contraseña para tu cuenta de Educommerce." },
    { property: "og:title", content: "Nueva contraseña | Educommerce" },
    { property: "og:description", content: "Crea una nueva contraseña para tu cuenta de Educommerce." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("clave") ?? "");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError("El enlace expiró. Pide uno nuevo desde Ingresar.");
    navigate({ to: "/campus" });
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Crea una nueva contraseña</h1>
        <form className="auth-form" onSubmit={submit} noValidate>
          <label>Nueva contraseña<input name="clave" type="password" autoComplete="new-password" minLength={8} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Guardando…" : "Guardar contraseña"}</Button>
        </form>
      </div>
    </main>
  );
}
