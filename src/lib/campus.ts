import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const campusQuery = queryOptions({
  queryKey: ["campus"],
  queryFn: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Tu sesión expiró. Vuelve a ingresar.");
    const [profile, owned, progress, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("accesos").select("module_id").eq("user_id", user.id),
      supabase.from("progreso").select("module_id, capsula").eq("user_id", user.id),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    for (const res of [profile, owned, progress, roles]) if (res.error) throw res.error;
    return {
      user: { id: user.id, email: user.email ?? "" },
      profile: profile.data,
      owned: (owned.data ?? []).map(a => a.module_id),
      progress: progress.data ?? [],
      isAdmin: (roles.data ?? []).some(r => r.role === "admin"),
    };
  },
});

export type CampusData = Awaited<ReturnType<NonNullable<typeof campusQuery.queryFn>>>;

export function completedFor(data: CampusData, moduleId: string) {
  return data.progress.filter(p => p.module_id === moduleId).map(p => p.capsula);
}
