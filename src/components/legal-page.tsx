import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="shell legal-page">
        <h1>{title}</h1>
        <p className="legal-updated">Última actualización: {updated}</p>
        <div className="legal-body">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
