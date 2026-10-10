import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Users, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusNav, CampusLoading } from "@/components/campus-nav";
import { campusQuery } from "@/lib/campus";
import { formatPrice, modules } from "@/lib/educommerce";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Administración | Educommerce" },
    { name: "description", content: "Alumnos, accesos y lista de espera de Educommerce." },
    { property: "og:title", content: "Administración | Educommerce" },
    { property: "og:description", content: "Alumnos, accesos y lista de espera de Educommerce." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusQuery),
  pendingComponent: CampusLoading,
  component: AdminPage,
});

const adminQuery = queryOptions({
  queryKey: ["admin"],
  queryFn: async () => {
    const [p, a, g, w] = await Promise.all([
      supabase.from("profiles").select("id, nombre, apellido, correo, created_at").order("created_at", { ascending: false }),
      supabase.from("accesos").select("user_id, module_id"),
      supabase.from("progreso").select("user_id, module_id, capsula"),
      supabase.from("lista_espera").select("id, nombre, correo, created_at").order("created_at", { ascending: false }),
    ]);
    for (const r of [p, a, g, w]) if (r.error) throw r.error;
    return { profiles: p.data!, accesos: a.data!, progreso: g.data!, espera: w.data! };
  },
});

type Tab = "resumen" | "alumnos" | "modulos" | "espera";
const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

function AdminPage() {
  const { data: me } = useSuspenseQuery(campusQuery);
  if (!me.isAdmin) return <><CampusNav isAdmin={false} /><main className="campus-main"><div className="campus-panel campus-empty"><p>No tienes permisos para ver esta página.</p><Button asChild variant="outline"><Link to="/campus">Volver a mi campus</Link></Button></div></main></>;
  return <><CampusNav isAdmin /><AdminBody /></>;
}

function AdminBody() {
  const [tab, setTab] = useState<Tab>("resumen");
  const { data, isLoading, error } = useQuery(adminQuery);
  const queryClient = useQueryClient();
  const [busyKey, setBusyKey] = useState("");
  const [actionError, setActionError] = useState("");

  async function toggleAccess(userId: string, moduleId: string, has: boolean) {
    setBusyKey(userId + moduleId); setActionError("");
    const res = has
      ? await supabase.from("accesos").delete().eq("user_id", userId).eq("module_id", moduleId)
      : await supabase.from("accesos").insert({ user_id: userId, module_id: moduleId });
    if (res.error) setActionError("No pudimos actualizar el acceso.");
    await queryClient.invalidateQueries({ queryKey: adminQuery.queryKey });
    queryClient.invalidateQueries({ queryKey: campusQuery.queryKey });
    setBusyKey("");
  }

  const tabs: [Tab, string][] = [["resumen", "Resumen"], ["alumnos", "Alumnos"], ["modulos", "Módulos"], ["espera", "Lista de espera"]];
  return <main className="campus-main">
    <h1 className="campus-h1">Administración</h1>
    <div className="filters" role="group" aria-label="Secciones">{tabs.map(([v, t]) => <Button key={v} variant="filter" aria-pressed={tab === v} onClick={() => setTab(v)}>{t}</Button>)}</div>
    {isLoading && <CampusLoading />}
    {error && <p className="form-error" role="alert">No pudimos cargar los datos.</p>}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}
    {data && tab === "resumen" && <>
      <div className="kpi-grid">
        <div className="campus-panel kpi"><span><Users aria-hidden="true" /> Alumnos</span><strong>{data.profiles.length}</strong></div>
        <div className="campus-panel kpi"><span><KeyRound aria-hidden="true" /> Accesos activos</span><strong>{data.accesos.length}</strong></div>
        <div className="campus-panel kpi"><span><CheckCircle2 aria-hidden="true" /> Cápsulas completadas</span><strong>{data.progreso.length}</strong></div>
        <div className="campus-panel kpi"><span><Mail aria-hidden="true" /> Lista de espera</span><strong>{data.espera.length}</strong></div>
      </div>
      <section className="campus-panel">
        <h2 className="campus-h2">Alumnos por módulo</h2>
        {modules.map(m => { const n = data.accesos.filter(a => a.module_id === m.id).length; const max = Math.max(1, data.profiles.length); return <div key={m.id} className="bar-row"><span>{m.title}</span><span className="progress"><span style={{ width: `${(n / max) * 100}%` }} /></span><strong>{n}</strong></div>; })}
      </section>
    </>}
    {data && tab === "alumnos" && (data.profiles.length === 0 ? <p className="muted-text">Aún no hay alumnos registrados.</p> :
      <div className="admin-list">{data.profiles.map(p => <article key={p.id} className="campus-panel admin-student">
        <div><h2>{[p.nombre, p.apellido].filter(Boolean).join(" ") || "Sin nombre"}</h2><p className="muted-text">{p.correo} · desde {fecha(p.created_at)}</p></div>
        <fieldset><legend>Acceso a módulos</legend><div className="access-grid">{modules.map(m => { const has = data.accesos.some(a => a.user_id === p.id && a.module_id === m.id); return <label key={m.id} className="access-toggle"><input type="checkbox" checked={has} disabled={busyKey === p.id + m.id} onChange={() => toggleAccess(p.id, m.id, has)} /> {String(m.number).padStart(2, "0")} {m.title}</label>; })}</div></fieldset>
      </article>)}</div>)}
    {data && tab === "modulos" && <div className="campus-panel admin-table">{modules.map(m => <div key={m.id} className="admin-row"><span className="module-number">{String(m.number).padStart(2, "0")}</span><span className="grow">{m.title}</span><span className="muted-text">{m.category}</span><strong>{formatPrice(m.price)}</strong><span className="module-tag">{data.accesos.filter(a => a.module_id === m.id).length} alumnos</span></div>)}</div>}
    {data && tab === "espera" && (data.espera.length === 0 ? <p className="muted-text">Aún no hay registros en la lista de espera.</p> :
      <div className="campus-panel admin-table">{data.espera.map(w => <div key={w.id} className="admin-row"><span className="grow">{w.nombre}</span><span>{w.correo}</span><span className="muted-text">{fecha(w.created_at)}</span></div>)}</div>)}
  </main>;
}
