import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Lock, PlayCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusNav, CampusLoading } from "@/components/campus-nav";
import { campusQuery, completedFor } from "@/lib/campus";
import { getCapsules, getModule, moduleProgress, resources } from "@/lib/educommerce";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/campus/$moduleId")({
  head: () => ({ meta: [
    { title: "Módulo | Campus Educommerce" },
    { name: "description", content: "Cápsulas, progreso y recursos del módulo." },
    { property: "og:title", content: "Módulo | Campus Educommerce" },
    { property: "og:description", content: "Cápsulas, progreso y recursos del módulo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusQuery),
  pendingComponent: CampusLoading,
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const { data } = useSuspenseQuery(campusQuery);
  const queryClient = useQueryClient();
  const mod = getModule(moduleId);
  const capsules = getCapsules(moduleId);
  const done = completedFor(data, moduleId);
  const [current, setCurrent] = useState(() => capsules.find(c => !done.includes(c.n))?.n ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!mod) return <><CampusNav isAdmin={data.isAdmin} /><main className="campus-main"><div className="campus-panel campus-empty"><p>Este módulo no existe.</p><Button asChild variant="outline"><Link to="/campus">Volver a mi campus</Link></Button></div></main></>;
  const hasAccess = data.owned.includes(mod.id);
  const pct = moduleProgress(mod.id, done);
  const cap = capsules.find(c => c.n === current) ?? capsules[0];
  if (!cap) return <><CampusNav isAdmin={data.isAdmin} /><main className="campus-main"><p>Contenido en preparación.</p></main></>;
  const isDone = done.includes(cap.n);

  async function toggle() {
    setSaving(true); setError("");
    const res = isDone
      ? await supabase.from("progreso").delete().eq("user_id", data.user.id).eq("module_id", moduleId).eq("capsula", cap.n)
      : await supabase.from("progreso").insert({ user_id: data.user.id, module_id: moduleId, capsula: cap.n });
    if (res.error) setError("No pudimos guardar tu avance. Inténtalo de nuevo.");
    await queryClient.invalidateQueries({ queryKey: campusQuery.queryKey });
    setSaving(false);
  }

  return <>
    <CampusNav isAdmin={data.isAdmin} />
    <main className="campus-main">
      <Link to="/campus" className="back-link"><ArrowLeft aria-hidden="true" /> Mi campus</Link>
      <header className="campus-module-head">
        <div className="module-meta"><span className="module-number">{String(mod.number).padStart(2, "0")}</span><span className="module-tag">{mod.category}</span></div>
        <h1>{mod.title}</h1>
        <p>{mod.description}</p>
        {hasAccess && <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del módulo"><span style={{ width: `${pct}%` }} /></div>}
      </header>
      {!hasAccess ? (
        <div className="campus-panel campus-empty"><Lock aria-hidden="true" /><p>Todavía no tienes acceso a este módulo.</p><Button asChild variant="outline"><Link to="/modulos">Ver catálogo</Link></Button></div>
      ) : (
        <div className="lesson-layout">
          <section className="campus-panel lesson-player" aria-label={`Cápsula ${cap.n}`}>
            <div className="video-placeholder"><PlayCircle aria-hidden="true" /><span>Video pendiente · Cápsula {cap.n}</span></div>
            <h2>{cap.title}</h2>
            <p>{cap.description}</p>
            <Button onClick={toggle} disabled={saving} variant={isDone ? "outline" : "default"}>{saving ? "Guardando…" : isDone ? "Marcar como pendiente" : <>Marcar como completada <Check /></>}</Button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </section>
          <aside className="campus-panel capsule-list" aria-label="Cápsulas del módulo">
            <h2>Cápsulas</h2>
            <ol>{capsules.map(c => <li key={c.n}><Button variant="secondary" type="button" aria-current={c.n === current ? "true" : undefined} onClick={() => setCurrent(c.n)}>
              <span className={done.includes(c.n) ? "capsule-check is-done" : "capsule-check"}>{done.includes(c.n) ? <Check aria-label="Completada" /> : c.n}</span>
              <span>{c.title}{c.minutes ? <small>{c.minutes} min</small> : null}</span>
            </Button></li>)}</ol>
            <h2>Recursos</h2>
            {resources.filter(r => r.moduleId === mod.id).map(r => <p key={r.title} className="resource-mini"><FileText aria-hidden="true" /> {r.title} <small>{r.format} · Archivo pendiente</small></p>)}
            {!resources.some(r => r.moduleId === mod.id) && <p className="muted-text">Aún no hay recursos para este módulo.</p>}
          </aside>
        </div>
      )}
    </main>
  </>;
}
