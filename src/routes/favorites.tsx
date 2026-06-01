import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ArrowRight, Trash2, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "المفضلة | صحتي" }] }),
  component: FavPage,
});

type Fav = { id: string; kind: string; target_id: string; target_name: string; target_meta: any };

function FavPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState<Fav[]>([]);

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (user) load();
  }, [user, loading]);

  async function load() {
    const { data } = await supabase.from("favorites").select("*").order("created_at", { ascending: false });
    setFavs((data ?? []) as Fav[]);
  }

  async function remove(id: string) {
    await supabase.from("favorites").delete().eq("id", id);
    toast.success("تمت الإزالة من المفضلة");
    setFavs((f) => f.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">المفضلة</h1>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {favs.length === 0 && (
          <div className="bg-card rounded-3xl p-10 text-center shadow-card">
            <Heart className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="font-bold">لا توجد عناصر في المفضلة</p>
            <p className="text-xs text-muted-foreground mt-1">ابدأ بإضافة الأطباء والمزودين المفضلين لديك</p>
          </div>
        )}
        {favs.map((f) => (
          <div key={f.id} className="bg-card rounded-3xl p-4 shadow-card border border-border/40 flex items-center gap-3">
            {f.target_meta?.image && (
              <img src={f.target_meta.image} alt={f.target_name} className="w-16 h-16 rounded-2xl object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm line-clamp-1">{f.target_name}</h4>
              <p className="text-xs text-primary font-bold mt-0.5">{f.kind === "doctor" ? "طبيب" : "مزود خدمة"}</p>
              {f.target_meta?.city && (
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin size={10} />{f.target_meta.city}
                </p>
              )}
            </div>
            {f.kind === "provider" && (
              <Link to="/provider/$id" params={{ id: f.target_id }}
                className="text-xs font-bold text-primary px-3 py-1.5 rounded-xl bg-primary/10">عرض</Link>
            )}
            <button onClick={() => remove(f.id)} className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
