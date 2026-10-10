import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CheckCircle2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusNav, CampusLoading } from "@/components/campus-nav";
import { campusQuery, completedFor } from "@/lib/campus";
import { formatPrice, getCapsules, moduleProgress, modules } from "@/lib/educommerce";

export const Route = createFileRoute("/_authenticated/campus/")({
  head: () => ({ meta: [
    { title: "Mi campus | Educommerce" },
    { name: "description", content: "Tus módulos, tu progreso y lo que sigue en Educommerce." },
    { property: "og:title", content: "Mi campus | Educommerce" },
    { property: "og:description", content: "Tus módulos, tu progreso y lo que sigue en Educommerce." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusQuery),
  pendingComponent: CampusLoading,
  component: CampusHome,
});

function CampusHome() {
  const { data } = useSuspenseQuery(campusQuery);
  const owned = modules.filter(m => data.owned.includes(m.id));
  const others = modules.filter(m => !data.owned.includes(m.id));
  const totalCaps = owned.reduce((a, m) => a + getCapsules(m.id).length, 0);
  const doneCaps = owned.reduce((a, m) => a + completedFor(data, m.id).length, 0);
  const overall = totalCaps ? Math.round((doneCaps / totalCaps) * 100) : 0;
  const next = owned.find(m => moduleProgress(m.id, completedFor(data, m.id)) < 100);
  const name = data.profile?.nombre || "de nuevo";

  return <>
    <CampusNav isAdmin={data.isAdmin} />
    <main className="campus-main">
      <section className="campus-welcome">
        <div className="campus-panel campus-hello">
          <h1>Hola, {name}.<br /><span className="green-text">Sigue construyendo.</span></h1>
          <p>Cada módulo te acerca a tu próximo proyecto. Sigue aprendiendo y aplica lo que sabes.</p>
          {next && <Button asChild size="lg"><Link to="/campus/$moduleId" params={{ moduleId: next.id }}>Continuar {next.title} <ArrowRight /></Link></Button>}
        </div>
        <div className="campus-panel campus-stats">
          <h2>Tu progreso general</h2>
          <div className="stat-row"><span className="stat-icon"><BookOpen aria-hidden="true" /></span><strong>{owned.length}</strong><span>Módulos activos</span></div>
          <div className="stat-row"><span className="stat-icon"><CheckCircle2 aria-hidden="true" /></span><strong>{doneCaps}</strong><span>Cápsulas completadas</span></div>
          <div className="stat-row"><span className="stat-icon"><Gauge aria-hidden="true" /></span><strong>{overall}%</strong><span>Progreso general</span></div>
        </div>
      </section>

      <section aria-labelledby="mis-modulos">
        <h2 id="mis-modulos" className="campus-h2">Mis módulos</h2>
        {owned.length === 0 ? (
          <div className="campus-panel campus-empty">
            <p>Aún no tienes módulos activos. Cuando se active tu acceso, aparecerán aquí.</p>
            <Button asChild variant="outline"><Link to="/modulos">Ver catálogo</Link></Button>
          </div>
        ) : (
          <div className="campus-module-list">
            {owned.map(m => {
              const pct = moduleProgress(m.id, completedFor(data, m.id));
              return <article key={m.id} className="campus-panel campus-module">
                <div className="module-meta"><span className="module-number">{String(m.number).padStart(2, "0")}</span><span className="module-tag">{m.category}</span>{pct === 100 && <span className="module-tag">Completado</span>}</div>
                <h3>{m.title}</h3>
                <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de ${m.title}`}><span style={{ width: `${pct}%` }} /></div>
                <div className="campus-module-foot"><span>{pct}% completado</span><Button asChild variant={pct === 100 ? "secondary" : "default"}><Link to="/campus/$moduleId" params={{ moduleId: m.id }}>{pct === 100 ? "Repasar" : "Continuar"} <ArrowRight /></Link></Button></div>
              </article>;
            })}
          </div>
        )}
      </section>

      {others.length > 0 && <section aria-labelledby="explorar">
        <h2 id="explorar" className="campus-h2">Explorar más módulos</h2>
        <div className="campus-more">
          {others.map(m => <Link key={m.id} to="/modulos" className="campus-more-item"><span>{m.title}</span><span className="module-price">{formatPrice(m.price)}</span></Link>)}
        </div>
      </section>}
    </main>
  </>;
}
