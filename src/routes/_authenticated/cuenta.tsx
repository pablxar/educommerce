import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CampusNav, CampusLoading } from "@/components/campus-nav";
import { campusQuery } from "@/lib/campus";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({ meta: [
    { title: "Mi cuenta | Campus Educommerce" },
    { name: "description", content: "Tus datos personales y tu contraseña." },
    { property: "og:title", content: "Mi cuenta | Campus Educommerce" },
    { property: "og:description", content: "Tus datos personales y tu contraseña." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusQuery),
  pendingComponent: CampusLoading,
  component: CuentaPage,
});

const perfil = z.object({ nombre: z.string().trim().min(1, "Ingresa tu nombre.").max(100), apellido: z.string().trim().max(100), pais: z.string().trim().max(60) });

function CuentaPage() {
  const { data } = useSuspenseQuery(campusQuery);
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const initials = (data.profile?.nombre?.[0] ?? data.user.email[0] ?? "?").toUpperCase() + (data.profile?.apellido?.[0] ?? "").toUpperCase();

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = perfil.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setMsg({ ok: false, text: parsed.error.issues[0]?.message ?? "Revisa los datos." });
    setBusy(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", data.user.id);
    setBusy(false);
    setMsg(error ? { ok: false, text: "No pudimos guardar los cambios." } : { ok: true, text: "Cambios guardados." });
    queryClient.invalidateQueries({ queryKey: campusQuery.queryKey });
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const current_password = String(f.get("actual") ?? "");
    const password = String(f.get("nueva") ?? "");
    if (password.length < 8) return setPwMsg({ ok: false, text: "La nueva contraseña debe tener al menos 8 caracteres." });
    const attrs = { password, current_password };
    const { error } = await supabase.auth.updateUser(attrs);
    if (error) return setPwMsg({ ok: false, text: "No pudimos cambiar la contraseña. Revisa tu contraseña actual." });
    form.reset();
    setPwMsg({ ok: true, text: "Contraseña actualizada." });
  }

  return <>
    <CampusNav isAdmin={data.isAdmin} />
    <main className="campus-main campus-narrow">
      <div className="account-head">
        <span className="avatar" aria-hidden="true">{initials}</span>
        <div><h1 className="campus-h1">Mi cuenta</h1><p className="muted-text">{data.user.email}</p></div>
      </div>
      <section className="campus-panel">
        <h2 className="campus-h2">Datos personales</h2>
        <form className="account-form" onSubmit={saveProfile} noValidate>
          <label>Nombre<input name="nombre" defaultValue={data.profile?.nombre ?? ""} maxLength={100} autoComplete="given-name" /></label>
          <label>Apellido<input name="apellido" defaultValue={data.profile?.apellido ?? ""} maxLength={100} autoComplete="family-name" /></label>
          <label>País<input name="pais" defaultValue={data.profile?.pais ?? ""} maxLength={60} autoComplete="country-name" /></label>
          <label>Correo electrónico<input value={data.user.email} readOnly aria-readonly="true" /></label>
          <div className="account-actions"><Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</Button>{msg && <p className={msg.ok ? "form-notice" : "form-error"} role="status">{msg.text}</p>}</div>
        </form>
      </section>
      <section className="campus-panel">
        <h2 className="campus-h2">Cambiar contraseña</h2>
        <form className="account-form" onSubmit={changePassword} noValidate>
          <label>Contraseña actual<input name="actual" type="password" autoComplete="current-password" /></label>
          <label>Nueva contraseña<input name="nueva" type="password" autoComplete="new-password" minLength={8} /></label>
          <div className="account-actions"><Button type="submit" variant="outline">Cambiar contraseña</Button>{pwMsg && <p className={pwMsg.ok ? "form-notice" : "form-error"} role="status">{pwMsg.text}</p>}</div>
        </form>
      </section>
    </main>
  </>;
}
