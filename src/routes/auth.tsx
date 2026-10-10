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

  async function social(provider: "google" | "apple") {
    setError("");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) return setError(`No pudimos ingresar con ${provider === "google" ? "Google" : "Apple"}.`);
    if (!result.redirected) navigate({ to: safePath(redirect) });
  }

  function changeMode(next: Mode) {
    setMode(next); setError(""); setNotice("");
  }

  const titles: Record<Mode, string> = { ingresar: "Iniciar sesión", crear: "Crear cuenta", recuperar: "Recupera tu contraseña" };
  const subtitles: Record<Mode, string> = {
    ingresar: "Ingresa tus credenciales para acceder a tus módulos.",
    crear: "Crea tu cuenta y empieza a aprender hoy.",
    recuperar: "Te enviaremos un enlace para crear una nueva contraseña.",
  };
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link to="/" aria-label="Educommerce, inicio"><img className="auth-panel-logo" src={logo.url} alt="Educommerce" /></Link>
        <div className="auth-panel-copy">
          <h2>¿Qué quieres <span>aprender hoy?</span></h2>
          <p>Diez módulos prácticos de e-commerce, ads y contenido, listos para aplicar desde la primera clase.</p>
        </div>
        <ul className="auth-panel-points">
          <li>Clases prácticas, paso a paso</li>
          <li>Acceso de por vida a tus módulos</li>
          <li>Actualizaciones incluidas</li>
        </ul>
      </div>
      <div className="auth-card">
        <h1>{titles[mode]}</h1>
        {mode === "recuperar" && <p className="auth-subtitle">{subtitles[mode]}</p>}
        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === "crear" && <label>Nombre<input name="nombre" autoComplete="given-name" maxLength={100} required /></label>}
          <label>Correo electrónico<input name="correo" type="email" autoComplete="email" placeholder="tu@correo.com" maxLength={255} required /></label>
          {mode !== "recuperar" && <label>Contraseña<input name="clave" type="password" autoComplete={mode === "crear" ? "new-password" : "current-password"} minLength={8} required /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-notice" role="status">{notice}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Enviando…" : mode === "ingresar" ? "Continuar" : mode === "crear" ? "Crear cuenta" : "Enviar enlace"}</Button>
        </form>
        {mode === "ingresar" && <Button variant="link" className="auth-recovery" onClick={() => changeMode("recuperar")}>¿Olvidaste tu contraseña?</Button>}
        {mode !== "recuperar" && <>
          <div className="auth-divider"><span>o</span></div>
          <div className="auth-socials">
            <Button variant="outline" size="lg" onClick={() => social("google")} disabled={busy}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="google-mark">
                <path className="google-blue" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z" />
                <path className="google-green" d="M12 22c2.7 0 4.96-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.59A10 10 0 0 0 12 22Z" />
                <path className="google-yellow" d="M6.4 13.91a6 6 0 0 1 0-3.82V7.5H3.05a10 10 0 0 0 0 9l3.35-2.59Z" />
                <path className="google-red" d="M12 5.96c1.47 0 2.79.5 3.83 1.5L18.7 4.6A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.5l3.35 2.59C7.19 7.72 9.4 5.96 12 5.96Z" />
              </svg>
              <span>Continuar con Google</span>
            </Button>
            <Button variant="outline" size="lg" onClick={() => social("apple")} disabled={busy}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 12.54c.03 3.1 2.72 4.13 2.75 4.14-.02.07-.43 1.48-1.42 2.94-.86 1.26-1.75 2.52-3.15 2.54-1.37.03-1.82-.82-3.39-.82-1.57 0-2.07.79-3.37.85-1.35.05-2.38-1.36-3.24-2.61-1.77-2.56-3.12-7.25-1.3-10.41A5.04 5.04 0 0 1 8.2 6.59c1.34-.03 2.61.91 3.44.91.82 0 2.36-1.13 3.98-.96.68.03 2.59.27 3.82 2.08-.1.06-2.39 1.4-2.39 3.92ZM14.47 4.83c.72-.87 1.21-2.08 1.08-3.28-1.04.04-2.3.69-3.05 1.56-.67.77-1.26 2-1.1 3.17 1.16.09 2.35-.59 3.07-1.45Z" />
              </svg>
              <span>Continuar con Apple</span>
            </Button>
          </div>
          <p className="auth-switch">{mode === "ingresar" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} <Button variant="link" onClick={() => changeMode(mode === "ingresar" ? "crear" : "ingresar")}>{mode === "ingresar" ? "Crear cuenta" : "Iniciar sesión"}</Button></p>
        </>}
        {mode === "recuperar" && <Button variant="link" onClick={() => changeMode("ingresar")}>Volver a ingresar</Button>}
      </div>
    </main>
  );
}
