import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Plus, Search, Download, Upload, Trash2, Edit3, Save, X, Filter,
  LayoutGrid, List, Settings2, BarChart3, Sparkles, ArrowLeft,
  CheckCircle2, Circle, RefreshCw, FileSpreadsheet, Eye,
} from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  id: z.string().optional(),
  t: z.string().optional(),
});

export const Route = createFileRoute("/admin/soon")({
  validateSearch: (s) => searchSchema.parse(s),
  component: ModuleWorkbench,
  head: () => ({ meta: [{ title: "وحدة الإدارة | لوحة التحكم" }] }),
});

type Record_ = {
  id: string;
  title: string;
  description?: string;
  status: "active" | "pending" | "disabled";
  category?: string;
  value?: string;
  createdAt: string;
  updatedAt: string;
};

type Settings = Record<string, string | boolean>;

const storageKey = (mid: string, sub: string) => `sehati_admin_mod_${mid}_${sub}`;

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; }
  catch { return fallback; }
}
function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  visibility: "public",
  autoApprove: false,
  notify: true,
  language: "ar",
};

function toCSV(rows: Record_[]): string {
  const header = ["id","title","description","status","category","value","createdAt","updatedAt"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    header.join(","),
    ...rows.map(r => header.map(h => esc((r as any)[h])).join(",")),
  ].join("\n");
}

function ModuleWorkbench() {
  const { id, t } = Route.useSearch();
  const moduleId = id || "default";
  const title = t || "وحدة الإدارة";

  const recordsKey = storageKey(moduleId, "records");
  const settingsKey = storageKey(moduleId, "settings");

  const [tab, setTab] = useState<"overview" | "records" | "settings" | "insights">("overview");
  const [records, setRecords] = useState<Record_[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "disabled">("all");
  const [editing, setEditing] = useState<Record_ | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRecords(loadJSON<Record_[]>(recordsKey, []));
    setSettings(loadJSON<Settings>(settingsKey, DEFAULT_SETTINGS));
    setTab("overview");
    setQ("");
  }, [recordsKey, settingsKey]);

  useEffect(() => { saveJSON(recordsKey, records); }, [recordsKey, records]);
  useEffect(() => { saveJSON(settingsKey, settings); }, [settingsKey, settings]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const term = q.trim().toLowerCase();
      return (
        r.title.toLowerCase().includes(term) ||
        (r.description ?? "").toLowerCase().includes(term) ||
        (r.category ?? "").toLowerCase().includes(term)
      );
    });
  }, [records, q, statusFilter]);

  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter(r => r.status === "active").length;
    const pending = records.filter(r => r.status === "pending").length;
    const disabled = records.filter(r => r.status === "disabled").length;
    return { total, active, pending, disabled };
  }, [records]);

  const openNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      description: "",
      status: "active",
      category: "",
      value: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowForm(true);
  };
  const openEdit = (r: Record_) => { setEditing({ ...r }); setShowForm(true); };
  const cancelForm = () => { setEditing(null); setShowForm(false); };

  const saveRecord = () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error("العنوان مطلوب"); return; }
    const now = new Date().toISOString();
    setRecords(prev => {
      const exists = prev.find(r => r.id === editing.id);
      if (exists) return prev.map(r => r.id === editing.id ? { ...editing, updatedAt: now } : r);
      return [{ ...editing, updatedAt: now }, ...prev];
    });
    toast.success("تم الحفظ بنجاح");
    cancelForm();
  };

  const removeRecord = (rid: string) => {
    if (!confirm("حذف هذا السجل؟")) return;
    setRecords(prev => prev.filter(r => r.id !== rid));
    toast.success("تم الحذف");
  };

  const toggleStatus = (r: Record_) => {
    const next: Record_["status"] = r.status === "active" ? "disabled" : "active";
    setRecords(prev => prev.map(x => x.id === r.id ? { ...x, status: next, updatedAt: new Date().toISOString() } : x));
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV(records)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${moduleId}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير CSV");
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("Invalid");
        setRecords(parsed);
        toast.success(`تم استيراد ${parsed.length} سجل`);
      } catch { toast.error("ملف غير صالح"); }
    };
    reader.readAsText(file);
  };

  const seedSample = () => {
    const now = new Date().toISOString();
    const sample: Record_[] = Array.from({ length: 6 }).map((_, i) => ({
      id: crypto.randomUUID(),
      title: `${title} — عنصر ${i + 1}`,
      description: "عنصر تجريبي جاهز للتحرير والاستخدام",
      status: (["active", "pending", "disabled"] as const)[i % 3],
      category: ["أساسي", "متقدم", "مميز"][i % 3],
      value: String((i + 1) * 10),
      createdAt: now,
      updatedAt: now,
    }));
    setRecords(prev => [...sample, ...prev]);
    toast.success("تمت إضافة بيانات تجريبية");
  };

  const clearAll = () => {
    if (!confirm("مسح كل سجلات هذه الوحدة؟")) return;
    setRecords([]);
    toast.success("تم المسح");
  };

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Settings2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  وحدة نشطة
                </span>
                <span className="text-[10px] text-muted-foreground">ID: {moduleId}</span>
              </div>
              <h1 className="text-lg md:text-xl font-extrabold truncate">{title}</h1>
              <p className="text-xs text-muted-foreground">إدارة كاملة: إنشاء، تحرير، فلترة، تصدير، وإعدادات مستقلة لكل وحدة.</p>
            </div>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> رجوع للوحة
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
          {[
            { k: "overview", label: "نظرة عامة", icon: LayoutGrid },
            { k: "records", label: "السجلات", icon: List },
            { k: "settings", label: "الإعدادات", icon: Settings2 },
            { k: "insights", label: "التحليلات", icon: BarChart3 },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors border ${
                tab === t.k
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "الإجمالي", value: stats.total, color: "gradient-primary" },
              { label: "نشط", value: stats.active, color: "bg-success" },
              { label: "قيد المراجعة", value: stats.pending, color: "bg-warning" },
              { label: "معطّل", value: stats.disabled, color: "bg-muted-foreground/40" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className={`w-8 h-8 rounded-lg ${s.color} mb-2`} />
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> إجراءات سريعة
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setTab("records"); openNew(); }} className="rounded-xl gradient-primary text-primary-foreground text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> إضافة سجل جديد
              </button>
              <button onClick={seedSample} className="rounded-xl border border-border bg-background text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5 hover:border-primary/40">
                <RefreshCw className="h-3.5 w-3.5" /> بيانات تجريبية
              </button>
              <button onClick={exportCSV} className="rounded-xl border border-border bg-background text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5 hover:border-primary/40">
                <FileSpreadsheet className="h-3.5 w-3.5" /> تصدير CSV
              </button>
              <button onClick={() => setTab("settings")} className="rounded-xl border border-border bg-background text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5 hover:border-primary/40">
                <Settings2 className="h-3.5 w-3.5" /> فتح الإعدادات
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold text-sm mb-3">آخر السجلات</h3>
            {records.slice(0, 5).length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد سجلات بعد.</p>
            ) : (
              <ul className="divide-y divide-border">
                {records.slice(0, 5).map(r => (
                  <li key={r.id} className="py-2 flex items-center gap-2 text-sm">
                    {r.status === "active" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <span className="flex-1 truncate">{r.title}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString("ar-EG")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Records */}
      {tab === "records" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="بحث..."
                className="w-full rounded-xl border border-border bg-muted/40 pr-8 pl-3 py-2 text-xs outline-none focus:border-primary focus:bg-background"
              />
            </div>
            <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-background p-0.5">
              <Filter className="h-3.5 w-3.5 mx-1 text-muted-foreground" />
              {(["all","active","pending","disabled"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusFilter===s?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-muted"}`}>
                  {s==="all"?"الكل":s==="active"?"نشط":s==="pending"?"معلّق":"معطّل"}
                </button>
              ))}
            </div>
            <button onClick={openNew} className="rounded-xl gradient-primary text-primary-foreground text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> إضافة
            </button>
            <button onClick={exportCSV} className="rounded-xl border border-border bg-background text-xs font-bold px-2.5 py-2 inline-flex items-center gap-1" title="تصدير">
              <Download className="h-3.5 w-3.5" />
            </button>
            <label className="rounded-xl border border-border bg-background text-xs font-bold px-2.5 py-2 inline-flex items-center gap-1 cursor-pointer" title="استيراد JSON">
              <Upload className="h-3.5 w-3.5" />
              <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} />
            </label>
            <button onClick={clearAll} className="rounded-xl border border-destructive/40 text-destructive text-xs font-bold px-2.5 py-2 inline-flex items-center gap-1" title="مسح الكل">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {showForm && editing && (
            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">{records.find(r => r.id === editing.id) ? "تحرير سجل" : "سجل جديد"}</h3>
                <button onClick={cancelForm}><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})}
                  placeholder="العنوان *" className="rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                <input value={editing.category ?? ""} onChange={e => setEditing({...editing, category: e.target.value})}
                  placeholder="التصنيف" className="rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                <input value={editing.value ?? ""} onChange={e => setEditing({...editing, value: e.target.value})}
                  placeholder="القيمة" className="rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                <select value={editing.status} onChange={e => setEditing({...editing, status: e.target.value as Record_["status"]})}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs">
                  <option value="active">نشط</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="disabled">معطّل</option>
                </select>
                <textarea value={editing.description ?? ""} onChange={e => setEditing({...editing, description: e.target.value})}
                  placeholder="الوصف" rows={2} className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2 text-xs" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveRecord} className="rounded-xl gradient-primary text-primary-foreground text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5" /> حفظ
                </button>
                <button onClick={cancelForm} className="rounded-xl border border-border text-xs font-bold px-3 py-2">إلغاء</button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <List className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold mb-1">لا توجد سجلات</p>
                <p className="text-xs text-muted-foreground mb-3">ابدأ بإضافة أول سجل أو حمّل بيانات تجريبية</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={openNew} className="rounded-xl gradient-primary text-primary-foreground text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> إضافة
                  </button>
                  <button onClick={seedSample} className="rounded-xl border border-border text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> بيانات تجريبية
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="text-right p-2.5 font-bold">العنوان</th>
                      <th className="text-right p-2.5 font-bold hidden md:table-cell">التصنيف</th>
                      <th className="text-right p-2.5 font-bold">الحالة</th>
                      <th className="text-right p-2.5 font-bold hidden md:table-cell">آخر تحديث</th>
                      <th className="text-right p-2.5 font-bold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                        <td className="p-2.5">
                          <div className="font-bold truncate max-w-[220px]">{r.title}</div>
                          {r.description && <div className="text-muted-foreground truncate max-w-[220px]">{r.description}</div>}
                        </td>
                        <td className="p-2.5 hidden md:table-cell">{r.category || "—"}</td>
                        <td className="p-2.5">
                          <button onClick={() => toggleStatus(r)}
                            className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                              r.status==="active"?"bg-success/15 text-success":
                              r.status==="pending"?"bg-warning/15 text-warning":
                              "bg-muted text-muted-foreground"
                            }`}>
                            {r.status==="active"?"نشط":r.status==="pending"?"معلّق":"معطّل"}
                          </button>
                        </td>
                        <td className="p-2.5 hidden md:table-cell text-muted-foreground">
                          {new Date(r.updatedAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-2.5">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(r)} className="rounded-lg border border-border p-1.5 hover:border-primary hover:text-primary" title="تحرير">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => removeRecord(r.id)} className="rounded-lg border border-destructive/30 text-destructive p-1.5 hover:bg-destructive/10" title="حذف">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4">
          <h3 className="font-bold text-sm">إعدادات الوحدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ToggleRow label="تفعيل الوحدة" value={!!settings.enabled} onChange={v => setSettings(s => ({...s, enabled: v}))} />
            <ToggleRow label="الموافقة التلقائية" value={!!settings.autoApprove} onChange={v => setSettings(s => ({...s, autoApprove: v}))} />
            <ToggleRow label="الإشعارات" value={!!settings.notify} onChange={v => setSettings(s => ({...s, notify: v}))} />
            <SelectRow label="مستوى الظهور" value={String(settings.visibility)} options={[["public","عام"],["private","خاص"],["internal","داخلي"]]} onChange={v => setSettings(s => ({...s, visibility: v}))} />
            <SelectRow label="اللغة" value={String(settings.language)} options={[["ar","العربية"],["en","English"]]} onChange={v => setSettings(s => ({...s, language: v}))} />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={() => { saveJSON(settingsKey, settings); toast.success("تم حفظ الإعدادات"); }}
              className="rounded-xl gradient-primary text-primary-foreground text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5" /> حفظ الإعدادات
            </button>
            <button onClick={() => { setSettings(DEFAULT_SETTINGS); toast.success("تمت الاستعادة"); }}
              className="rounded-xl border border-border text-xs font-bold px-3 py-2 inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> استعادة الافتراضي
            </button>
          </div>
        </div>
      )}

      {/* Insights */}
      {tab === "insights" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> توزيع الحالات</h3>
            <div className="space-y-2">
              {[
                { k: "active", label: "نشط", value: stats.active, color: "bg-success" },
                { k: "pending", label: "قيد المراجعة", value: stats.pending, color: "bg-warning" },
                { k: "disabled", label: "معطّل", value: stats.disabled, color: "bg-muted-foreground/50" },
              ].map(row => {
                const pct = stats.total ? Math.round((row.value / stats.total) * 100) : 0;
                return (
                  <div key={row.k}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-bold">{row.label}</span><span className="text-muted-foreground">{row.value} ({pct}%)</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold text-sm mb-3">التصنيفات الأعلى</h3>
            {(() => {
              const map = new Map<string, number>();
              records.forEach(r => { const c = r.category || "بدون تصنيف"; map.set(c, (map.get(c) ?? 0) + 1); });
              const list = [...map.entries()].sort((a,b) => b[1]-a[1]).slice(0, 6);
              if (list.length === 0) return <p className="text-xs text-muted-foreground">لا توجد بيانات كافية.</p>;
              const max = list[0][1];
              return (
                <div className="space-y-2">
                  {list.map(([c, n]) => (
                    <div key={c}>
                      <div className="flex justify-between text-xs mb-1"><span>{c}</span><span className="text-muted-foreground">{n}</span></div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full gradient-primary" style={{ width: `${(n/max)*100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 cursor-pointer">
      <span className="text-xs font-bold">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"} relative`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${value ? "right-0.5" : "right-5"}`} />
      </button>
    </label>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: [string,string][]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <span className="text-xs font-bold">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-border bg-background text-xs px-2 py-1">
        {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
