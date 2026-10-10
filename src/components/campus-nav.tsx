import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo_educommerce.png.asset.json";

export function CampusNav({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const active = { className: "is-active" };
  return (
    <header className="campus-nav">
      <div className="campus-nav-inner">
        <Link to="/" aria-label="Educommerce, inicio"><img className="campus-logo" src={logo.url} alt="Educommerce" /></Link>
        <nav aria-label="Navegación del campus" className="campus-links">
          <Link to="/campus" activeProps={active} activeOptions={{ exact: true }}>Mi campus</Link>
          <Link to="/recursos" activeProps={active}>Recursos</Link>
          <Link to="/cuenta" activeProps={active}>Mi cuenta</Link>
          {isAdmin && <Link to="/admin" activeProps={active}>Administración</Link>}
        </nav>
        <Button type="button" variant="secondary" className="campus-signout" onClick={signOut}><LogOut aria-hidden="true" /> Salir</Button>
      </div>
    </header>
  );
}

export function CampusLoading() {
  return <p className="campus-status" role="status">Cargando…</p>;
}
