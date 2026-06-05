import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Newspaper, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "المحتوى | الإدارة" }] }),
  component: ContentAdmin,
});

const KINDS = [{ k: "article", t: "مقالات" }, { k: "news", t: "أخبار طبية" }, { k: "tip", t: "نصائح صحية" }, { k: "campaign", t: "حملات توعوية" }];

function ContentAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [kind, setKind] = useState("article");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { load(); }, [kind]);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("content_posts").select("*").eq("kind", kind).order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  async function save() {
    if (!editing?.title?.trim()) return toast.error("العنوان مطلوب");
    const payload = { ...editing, kind, published_at: editing.published ? (editing.published_at || new Date().toISOString()) : null };
    if (editing.id) {
      const { id, ...rest } = payload;
      await supabase.from("content_posts").update(rest).eq("id", id);
    } else {
      await supabase.from("content_posts").insert(payload);
    }
    setEditing(null); load();
  }
  async function del(id: string) {
    if (!confirm("حذف؟")) return;
    await supabase.from("content_posts").delete().eq("id", id); load();
  }

  return (
    <AdminShell title="إدارة المحتوى" subtitle="أخبار، مقالات، نصائح، حملات توعوية" icon={Newspaper}
      actions={<button onClick={() => setEditing({ title: "", published: false })}
        className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /></button>}>
      <div className="flex gap-2 overflow-x-auto">
        {KINDS.map((t) => (
          <button key={t.k} onClick={() => setKind(t.k)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ${kind === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Newspaper} title="لا يوجد محتوى" />
        : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((p) => (
              <div key={p.id} className="rounded-3xl border bg-card overflow-hidden">
                {p.image_url && <img src={p.image_url} className="w-full h-32 object-cover" />}
                <div className="p-3 space-y-1">
                  <div className="flex items-center gap-1">
                    {p.featured && <Sparkles size={12} className="text-warning" />}
                    <h4 className="font-bold text-sm flex-1 line-clamp-1">{p.title}</h4>
                  </div>
                  {p.excerpt && <p className="text-[10px] text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                  <div className="flex gap-2 pt-2">
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${p.published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{p.published ? "منشور" : "مسودة"}</span>
                    <button onClick={() => setEditing(p)} className="flex-1 text-[10px] font-bold rounded-xl bg-primary text-primary-foreground py-1">تعديل</button>
                    <button onClick={() => del(p.id)} className="rounded-xl bg-destructive/10 text-destructive p-1.5"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">{editing.id ? "تعديل" : "محتوى جديد"}</h3>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="العنوان"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <input value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="ملخص قصير"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <textarea value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} placeholder="المحتوى" rows={6}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <ImageUploader value={editing.image_url} onChange={(u) => setEditing({ ...editing, image_url: u })} folder="content" label="صورة الغلاف" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> نشر</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> مميّز</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={save} className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow">حفظ</button>
              <button onClick={() => setEditing(null)} className="rounded-2xl bg-muted px-4">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
