import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusNav, CampusLoading } from "@/components/campus-nav";
import { campusQuery } from "@/lib/campus";
import { getModule, resources } from "@/lib/educommerce";

export const Route = createFileRoute("/_authenticated/recursos")({
  head: () => ({ meta: [
    { title: "Recursos | Campus Educommerce" },
    { name: "description", content: "Plantillas, checklists y guías de tus módulos." },
    { property: "og:title", content: "Recursos | Campus Educommerce" },
    { property: "og:description", content: "Plantillas, checklists y guías de tus módulos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusQuery),
  pendingComponent: CampusLoading,
  component: RecursosPage,
});

function RecursosPage() {
  const { data } = useSuspenseQuery(campusQuery);
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("todos");
  const mine = resources.filter(r => data.owned.includes(r.moduleId));
  const mods = [...new Set(mine.map(r => r.moduleId))];
  const items = mine.filter(r => (mod === "todos" || r.moduleId === mod) && `${r.title} ${r.description}`.toLowerCase().includes(q.trim().toLowerCase()));
  return <>
    <CampusNav isAdmin={data.isAdmin} />
    <main className="campus-main campus-narrow">
      <h1 className="campus-h1">Biblioteca de recursos</h1>
      <p>Plantillas, checklists y guías de los módulos a los que tienes acceso.</p>
      <div className="resource-filters">
        <label className="search-field"><Search aria-hidden="true" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar recursos..." aria-label="Buscar recursos" /></label>
        <select value={mod} onChange={e => setMod(e.target.value)} aria-label="Filtrar por módulo">
          <option value="todos">Todos los módulos</option>
          {mods.map(id => <option key={id} value={id}>{getModule(id)?.title}</option>)}
        </select>
      </div>
      <p className="muted-text">{items.length} {items.length === 1 ? "recurso" : "recursos"}</p>
      {mine.length === 0 ? (
        <div className="campus-panel campus-empty"><p>Cuando tengas módulos activos, sus recursos aparecerán aquí.</p><Button asChild variant="outline"><Link to="/modulos">Ver catálogo</Link></Button></div>
      ) : items.length === 0 ? (
        <div className="campus-panel campus-empty"><p>No hay recursos que coincidan. Prueba con otro nombre o cambia el módulo.</p><Button variant="outline" onClick={() => { setQ(""); setMod("todos"); }}>Limpiar filtros</Button></div>
      ) : (
        <ul className="resource-list">{items.map(r => <li key={r.title} className="campus-panel resource-item">
          <span className="stat-icon"><FileText aria-hidden="true" /></span>
          <div><h2>{r.title}</h2><p>{r.description}</p><small>{getModule(r.moduleId)?.title} · {r.format}</small></div>
          <span className="module-tag">Archivo pendiente</span>
        </li>)}</ul>
      )}
    </main>
  </>;
}
