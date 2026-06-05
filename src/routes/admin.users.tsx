import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Loader2, Search, Shield } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "إدارة المستخدمين | الإدارة" }] }),
  component: UsersAdmin,
});

type U = { id: string; full_name: string | null; phone: string | null; city: string | null; created_at: string };

function UsersAdmin() {
  const [items, setItems] = useState<U[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setItems((p ?? []) as U[]);
    const map: Record<string, string[]> = {};
    (r ?? []).forEach((x: any) => { (map[x.user_id] ??= []).push(x.role); });
    setRoles(map);
    setLoading(false);
  }

  async function grantRole(uid: string, role: "admin" | "provider") {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: role as any });
    if (error) return toast.error(error.message);
    toast.success("تم منح الصلاحية"); load();
  }
  async function revokeRole(uid: string, role: string) {
    if (!confirm("سحب الصلاحية؟")) return;
    await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role as any);
    load();
  }

  const filtered = items.filter((u) => !q || (u.full_name || "").includes(q) || (u.phone || "").includes(q));

  return (
    <AdminShell title="مركز إدارة المستخدمين" subtitle="المرضى، الأطباء، الملاك، السكرتارية، المحظورون" icon={Users}>
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..."
          className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-2.5 text-sm" />
      </div>
      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : filtered.length === 0 ? <EmptyState icon={Users} title="لا يوجد مستخدمون" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {filtered.map((u) => {
              const ur = roles[u.id] || [];
              return (
                <div key={u.id} className="p-3 flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center font-extrabold shadow-glow">
                    {(u.full_name || "؟").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-bold text-sm">{u.full_name || "مستخدم"}</p>
                    <p className="text-[10px] text-muted-foreground">{u.phone || "—"} • {u.city || "—"}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ur.map((r) => (
                      <button key={r} onClick={() => revokeRole(u.id, r)}
                        className="text-[10px] font-bold rounded-full bg-primary/15 text-primary px-2 py-0.5 hover:bg-destructive/10 hover:text-destructive">
                        {r === "admin" ? "مشرف" : r === "provider" ? "منشأة" : r} ×
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {!ur.includes("admin") && <button onClick={() => grantRole(u.id, "admin")} className="text-[10px] font-bold rounded-xl bg-destructive/10 text-destructive px-2 py-1 flex items-center gap-1"><Shield size={10} /> مشرف</button>}
                    {!ur.includes("provider") && <button onClick={() => grantRole(u.id, "provider")} className="text-[10px] font-bold rounded-xl bg-accent/10 text-accent px-2 py-1">منشأة</button>}
                  </div>
                </div>
              );
            })}
          </div>}
    </AdminShell>
  );
}
