import {
  LayoutDashboard, Users, Building2, KeyRound, Stethoscope, MapPin, UserCog,
  Calendar, Briefcase, ShieldCheck, Package, ShieldAlert, Home, Sparkles,
  Megaphone, Percent, CreditCard, Wallet, Banknote, Bell, MessageSquare,
  FileBarChart, BarChart3, BrainCircuit, ScrollText, DatabaseBackup, Settings2,
  Paintbrush, QrCode, UserSquare2, Newspaper, Target,
} from "lucide-react";

export type Center = {
  id: string;
  num: number;
  title: string;
  desc: string;
  to: string;
  icon: any;
  hue: string;
  group: "operations" | "growth" | "money" | "ai" | "system";
};

export const CENTERS: Center[] = [
  { id: "overview", num: 1, title: "لوحة المعلومات الرئيسية", desc: "إحصائيات مباشرة لجميع الأنشطة", to: "/admin", icon: LayoutDashboard, hue: "primary", group: "operations" },
  { id: "users", num: 2, title: "مركز إدارة المستخدمين", desc: "المرضى، الأطباء، الملاك، المحظورون", to: "/admin/users", icon: Users, hue: "primary", group: "operations" },
  { id: "facilities", num: 3, title: "مركز إدارة المنشآت", desc: "عيادات، مستشفيات، مختبرات، أشعة، صيدليات", to: "/admin/facilities", icon: Building2, hue: "accent", group: "operations" },
  { id: "accounts", num: 4, title: "مركز إدارة الحسابات", desc: "إنشاء حسابات، روابط سرية، كلمات المرور", to: "/admin/tokens", icon: KeyRound, hue: "destructive", group: "system" },
  { id: "specialties", num: 5, title: "مركز التخصصات الطبية", desc: "تخصصات رئيسية وفرعية وخدمات", to: "/admin/specialties", icon: Stethoscope, hue: "accent", group: "operations" },
  { id: "cities", num: 6, title: "مركز المدن والمناطق", desc: "المدن، المناطق، الأحياء، المواقع", to: "/admin/cities", icon: MapPin, hue: "primary", group: "operations" },
  { id: "doctors", num: 7, title: "مركز إدارة الأطباء", desc: "أطباء، مميزون، موثقون، جداول، تقييمات", to: "/admin/doctors", icon: UserCog, hue: "accent", group: "operations" },
  { id: "bookings", num: 8, title: "مركز إدارة الحجوزات", desc: "جديدة، مؤكدة، مكتملة، ملغاة، متأخرة", to: "/admin/bookings", icon: Calendar, hue: "success", group: "operations" },
  { id: "services", num: 9, title: "مركز الخدمات الطبية", desc: "خدمات لكل نوع منشأة", to: "/admin/services", icon: Briefcase, hue: "accent", group: "operations" },
  { id: "verification", num: 10, title: "مركز التوثيق", desc: "طلبات، موثقون، رسوم، إعدادات", to: "/admin/verification", icon: ShieldCheck, hue: "primary", group: "operations" },
  { id: "packages", num: 11, title: "مركز الباقات", desc: "أساسية، احترافية، VIP، مميزات وحدود", to: "/admin/packages", icon: Package, hue: "warning", group: "money" },
  { id: "permissions", num: 12, title: "مركز الصلاحيات", desc: "صلاحيات لكل دور ومستوى", to: "/admin/permissions", icon: ShieldAlert, hue: "destructive", group: "system" },
  { id: "home", num: 13, title: "إدارة الصفحة الرئيسية", desc: "السلايدر، البنرات، المميزون، العروض", to: "/admin/home", icon: Home, hue: "warning", group: "growth" },
  { id: "smart", num: 14, title: "مركز الظهور الذكي", desc: "الأعلى تقييماً، الأكثر حجزاً، مفتوح الآن", to: "/admin/smart", icon: Sparkles, hue: "accent", group: "growth" },
  { id: "ads", num: 15, title: "مركز الإعلانات", desc: "بنرات، فيديوهات، باقات إعلانية", to: "/admin/ads", icon: Megaphone, hue: "warning", group: "growth" },
  { id: "offers", num: 16, title: "العروض والخصومات", desc: "عروض، كوبونات، حملات، جدولة", to: "/admin/offers", icon: Percent, hue: "warning", group: "growth" },
  { id: "subscriptions", num: 17, title: "إدارة الاشتراكات", desc: "نشطة، منتهية، معلقة، تجديدات", to: "/admin/subscriptions", icon: CreditCard, hue: "primary", group: "money" },
  { id: "finance", num: 18, title: "المركز المالي", desc: "إيرادات، أرباح، مصروفات، تقارير", to: "/admin/finance", icon: Wallet, hue: "success", group: "money" },
  { id: "payments", num: 19, title: "إدارة المدفوعات", desc: "فواتير، سحوبات، طرق دفع", to: "/admin/payments", icon: Banknote, hue: "success", group: "money" },
  { id: "notifications", num: 20, title: "مركز الإشعارات", desc: "إشعارات للمستخدمين والمنشآت والأطباء", to: "/admin/notifications", icon: Bell, hue: "primary", group: "growth" },
  { id: "support", num: 21, title: "الرسائل والدعم الفني", desc: "شكاوى، اقتراحات، تذاكر، محادثات", to: "/admin/support", icon: MessageSquare, hue: "accent", group: "operations" },
  { id: "reports", num: 22, title: "مركز التقارير", desc: "يومية، أسبوعية، شهرية، مخصصة", to: "/admin/reports", icon: FileBarChart, hue: "primary", group: "operations" },
  { id: "analytics", num: 23, title: "التحليلات الذكية", desc: "أداء المنشآت والأطباء ومعدلات النمو", to: "/admin/analytics", icon: BarChart3, hue: "primary", group: "ai" },
  { id: "ai", num: 24, title: "مركز الذكاء الاصطناعي", desc: "المساعد، الردود، الاقتراحات، النماذج", to: "/admin/ai", icon: BrainCircuit, hue: "accent", group: "ai" },
  { id: "audit", num: 25, title: "السجلات الأمنية", desc: "تسجيلات الدخول والعمليات الإدارية", to: "/admin/audit", icon: ScrollText, hue: "destructive", group: "system" },
  { id: "backup", num: 26, title: "النسخ الاحتياطي", desc: "يدوي، تلقائي، استعادة، أرشيف", to: "/admin/backup", icon: DatabaseBackup, hue: "primary", group: "system" },
  { id: "settings", num: 27, title: "إعدادات النظام", desc: "اسم التطبيق، الشعار، الهوية البصرية، OTP", to: "/admin/settings", icon: Settings2, hue: "primary", group: "system" },
  { id: "ui", num: 28, title: "واجهة التطبيق", desc: "تصميم، ترتيب، ألوان، أيقونات، نصوص", to: "/admin/ui", icon: Paintbrush, hue: "accent", group: "system" },
  { id: "qr", num: 29, title: "إدارة QR والمواعيد", desc: "مسح، حضور، إعدادات، تقارير", to: "/admin/qr", icon: QrCode, hue: "primary", group: "operations" },
  { id: "reception", num: 30, title: "إدارة السكرتارية", desc: "حسابات، صلاحيات، سجلات، مهام", to: "/dashboard/reception", icon: UserSquare2, hue: "accent", group: "operations" },
  { id: "content", num: 31, title: "إدارة المحتوى", desc: "أخبار، مقالات، نصائح، حملات توعوية", to: "/admin/content", icon: Newspaper, hue: "accent", group: "growth" },
  { id: "targets", num: 32, title: "أهداف الصفحة الرئيسية", desc: "الأعلى تقييماً، الأكثر حجزاً، الحملات", to: "/admin/home", icon: Target, hue: "warning", group: "growth" },
];

export const GROUPS: Record<Center["group"], string> = {
  operations: "العمليات والتشغيل",
  growth: "النمو والتسويق",
  money: "المالية والاشتراكات",
  ai: "الذكاء والتحليلات",
  system: "النظام والإعدادات",
};
