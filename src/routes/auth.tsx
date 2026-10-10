import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo_educommerce.png.asset.json";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({ meta: [
    { title: "Ingresar al campus | Educommerce" },
    { name: "description", content: "Ingresa o crea tu cuenta para entrar al campus de Educommerce." },
    { property: "og:title", content: "Ingresar al campus | Educommerce" },
    { property: "og:description", content: "Accede a tus módulos, tu progreso y tus recursos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AuthPage,
});

type Mode = "ingresar" | "crear" | "recuperar";

function safePath(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/campus";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("ingresar");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setNotice("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("correo") ?? "").trim();
    const password = String(f.get("clave") ?? "");
    const nombre = String(f.get("nombre") ?? "").trim();
    if (!z.string().email().safeParse(email).success) return setError("Ingresa un correo válido.");
    if (mode !== "recuperar" && password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (mode === "crear" && !nombre) return setError("Ingresa tu nombre.");
    setBusy(true);
    try {
      if (mode === "ingresar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError("Correo o contraseña incorrectos, o falta confirmar tu correo.");
        navigate({ to: safePath(redirect) });
      } else if (mode === "crear") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/campus`, data: { nombre } } });
        if (error) return setError(error.message.includes("registered") ? "Ese correo ya tiene cuenta. Ingresa con tu contraseña." : "No pudimos crear la cuenta. Inténtalo de nuevo.");
        setNotice("Revisa tu correo y confirma tu cuenta para entrar al campus.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) return setError("No pudimos enviar el correo. Inténtalo de nuevo.");
        setNotice("Si el correo tiene cuenta, te enviamos un enlace para crear una nueva contraseña.");
      }
    } finally { setBusy(false); }
  }

  async function google() {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) return setError("No pudimos ingresar con Google.");
    if (!result.redirected) navigate({ to: safePath(redirect) });
  }

  const titles: Record<Mode, string> = { ingresar: "Ingresa a tu campus", crear: "Crea tu cuenta", recuperar: "Recupera tu contraseña" };
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" aria-label="Educommerce, inicio"><img className="campus-logo" src={logo.url} alt="Educommerce" /></Link>
        <h1>{titles[mode]}</h1>
        {mode !== "recuperar" && <>
          <div className="auth-tabs" role="group" aria-label="Elegir acción">
            <Button variant="filter" aria-pressed={mode === "ingresar"} onClick={() => setMode("ingresar")}>Ingresar</Button>
            <Button variant="filter" aria-pressed={mode === "crear"} onClick={() => setMode("crear")}>Crear cuenta</Button>
          </div>
          <Button variant="outline" size="lg" className="auth-google" onClick={google}>Continuar con Google</Button>
          <p className="auth-divider">o con tu correo</p>
        </>}
        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === "crear" && <label>Nombre<input name="nombre" autoComplete="given-name" maxLength={100} required /></label>}
          <label>Correo electrónico<input name="correo" type="email" autoComplete="email" maxLength={255} required /></label>
          {mode !== "recuperar" && <label>Contraseña<input name="clave" type="password" autoComplete={mode === "crear" ? "new-password" : "current-password"} minLength={8} required /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-notice" role="status">{notice}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Enviando…" : mode === "ingresar" ? "Ingresar" : mode === "crear" ? "Crear cuenta" : "Enviar enlace"}</Button>
        </form>
        {mode === "ingresar" && <button type="button" className="text-button" onClick={() => setMode("recuperar")}>¿Olvidaste tu contraseña?</button>}
        {mode === "recuperar" && <button type="button" className="text-button" onClick={() => setMode("ingresar")}>Volver a ingresar</button>}
      </div>
    </main>
  );
}
