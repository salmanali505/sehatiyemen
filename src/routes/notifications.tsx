import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ArrowRight, Calendar, Sparkles, Heart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | صحتي" }] }),
  component: NotifPage,
});

const notifs = [
  { icon: Calendar, color: "bg-primary/15 text-primary", title: "تذكير بالموعد", body: "موعدك مع د. أحمد الحضرمي غداً الساعة 10:00", time: "منذ ساعة" },
  { icon: Sparkles, color: "bg-warning/15 text-warning", title: "عرض جديد", body: "خصم 40% على الفحص الشامل في مختبر السلام", time: "منذ 3 ساعات" },
  { icon: Heart, color: "bg-success/15 text-success", title: "متابعة جديدة", body: "تم تفعيل متابعتك لمجمع الحياة الطبي", time: "أمس" },
  { icon: Bell, color: "bg-secondary/15 text-secondary", title: "تحديث الحجز", body: "تم تأكيد حجزك رقم SH-AB12CD34", time: "أمس" },
];

function NotifPage() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">الإشعارات</h1>
        </div>
      </div>
      <div className="px-4 space-y-2">
        {notifs.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={i} className="bg-card rounded-2xl p-4 shadow-card flex gap-3 border border-border/40">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.color}`}><Icon size={18} /></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm">{n.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
