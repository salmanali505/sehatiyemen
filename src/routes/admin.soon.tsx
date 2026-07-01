import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Wrench } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ t: z.string().optional() });

export const Route = createFileRoute("/admin/soon")({
  validateSearch: (s) => searchSchema.parse(s),
  component: SoonPage,
  head: () => ({ meta: [{ title: "قريباً | لوحة التحكم" }] }),
});

function SoonPage() {
  const { t } = Route.useSearch();
  const title = t || "هذه الوحدة";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full text-center space-y-4 rounded-3xl border bg-card p-8 shadow-elegant">
        <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Wrench className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 px-2 py-1 rounded-full mb-2">
            <Sparkles className="h-3 w-3" /> قيد التطوير
          </div>
          <h1 className="text-xl font-extrabold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            هذه الوحدة جاهزة معمارياً وستُفعّل في المراحل القادمة. جميع الصلاحيات، التصنيفات،
            وقواعد البيانات موجودة مسبقاً.
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
        >
          العودة إلى لوحة التحكم
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
