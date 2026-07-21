import { useMemo } from "react";
import {
  LayoutDashboard, Users, Building2, Stethoscope, Calendar, Bell, Gift, Megaphone,
  MapPin, Layers, BadgeCheck, Shield, History, Banknote, CreditCard, ReceiptText,
  Package, Brain, Compass, LineChart, Settings, QrCode, FolderTree, Home as HomeIcon,
  Palette, ShieldCheck, LifeBuoy, Star, MessageSquare, Wallet, ClipboardList,
  UserPlus, Scan, User, Cog, type LucideIcon,
} from "lucide-react";
import { useRoles } from "@/lib/useRoles";

export type DashRole = "admin" | "provider" | "reception" | "none";

export type DashNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  group?: string;
};

export function useDashRole(): { role: DashRole; loading: boolean } {
  const { isAdmin, isProvider, loading } = useRoles();
  const role: DashRole = isAdmin ? "admin" : isProvider ? "provider" : "none";
  return { role, loading };
}

const ADMIN_NAV: DashNavItem[] = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard, group: "عام" },
  { to: "/admin/analytics", label: "التحليلات", icon: LineChart, group: "عام" },
  { to: "/admin/audit", label: "سجل النشاط", icon: History, group: "عام" },

  { to: "/admin/users", label: "المستخدمون", icon: Users, group: "الأشخاص" },
  { to: "/admin/permissions", label: "الأدوار والصلاحيات", icon: Shield, group: "الأشخاص" },

  { to: "/admin/facilities", label: "المنشآت", icon: Building2, group: "المزوّدون" },
  { to: "/admin/doctors", label: "الأطباء", icon: Stethoscope, group: "المزوّدون" },
  { to: "/admin/services", label: "الخدمات", icon: Package, group: "المزوّدون" },
  { to: "/admin/specialties", label: "التخصصات", icon: Layers, group: "المزوّدون" },
  { to: "/admin/verification", label: "التوثيق", icon: BadgeCheck, group: "المزوّدون" },

  { to: "/admin/bookings", label: "الحجوزات", icon: Calendar, group: "العمليات" },
  { to: "/admin/qr", label: "التحقق QR", icon: QrCode, group: "العمليات" },
  { to: "/admin/tokens", label: "روابط الوصول", icon: Wallet, group: "العمليات" },

  { to: "/admin/ads", label: "الإعلانات", icon: Megaphone, group: "المحتوى" },
  { to: "/admin/offers", label: "العروض", icon: Gift, group: "المحتوى" },
  { to: "/admin/content", label: "المحتوى", icon: FolderTree, group: "المحتوى" },
  { to: "/admin/home", label: "الشاشة الرئيسية", icon: HomeIcon, group: "المحتوى" },
  { to: "/admin/cities", label: "المدن", icon: MapPin, group: "المحتوى" },

  { to: "/admin/finance", label: "المالية", icon: Banknote, group: "المالية" },
  { to: "/admin/payments", label: "المدفوعات", icon: ReceiptText, group: "المالية" },
  { to: "/admin/payment-methods", label: "طرق الدفع", icon: CreditCard, group: "المالية" },
  { to: "/admin/packages", label: "الخطط", icon: Package, group: "المالية" },
  { to: "/admin/subscriptions", label: "الاشتراكات", icon: CreditCard, group: "المالية" },

  { to: "/admin/notifications", label: "الإشعارات", icon: Bell, group: "التواصل" },
  { to: "/admin/support", label: "الدعم", icon: LifeBuoy, group: "التواصل" },

  { to: "/admin/ai", label: "الذكاء الاصطناعي", icon: Brain, group: "متقدّم" },
  { to: "/admin/smart", label: "الترتيب الذكي", icon: Compass, group: "متقدّم" },
  { to: "/admin/reports", label: "التقارير", icon: ClipboardList, group: "متقدّم" },
  { to: "/admin/backup", label: "النسخ الاحتياطي", icon: ShieldCheck, group: "متقدّم" },

  { to: "/admin/ui", label: "الثيم والواجهة", icon: Palette, group: "الإعدادات" },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings, group: "الإعدادات" },
];

const PROVIDER_NAV: DashNavItem[] = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, group: "عام" },
  { to: "/dashboard", label: "الحجوزات", icon: Calendar, group: "العمليات" },
  { to: "/dashboard", label: "الخدمات", icon: Package, group: "الملف" },
  { to: "/dashboard", label: "الأطباء", icon: Stethoscope, group: "الملف" },
  { to: "/dashboard", label: "العروض", icon: Gift, group: "التسويق" },
  { to: "/dashboard", label: "الإعلانات", icon: Megaphone, group: "التسويق" },
  { to: "/dashboard", label: "التقييمات", icon: Star, group: "التفاعل" },
  { to: "/dashboard", label: "الاستقبال", icon: UserPlus, group: "التشغيل" },
  { to: "/dashboard", label: "الملف الشخصي", icon: User, group: "الإعدادات" },
];

const RECEPTION_NAV: DashNavItem[] = [
  { to: "/dashboard/reception", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/dashboard/reception", label: "حجوزات اليوم", icon: Calendar },
  { to: "/dashboard/reception", label: "مسح QR", icon: Scan },
  { to: "/dashboard/reception", label: "المرضى", icon: Users },
  { to: "/dashboard/reception", label: "الإعدادات", icon: Cog },
];

export function useDashMenu(role: DashRole): DashNavItem[] {
  return useMemo(() => {
    if (role === "admin") return ADMIN_NAV;
    if (role === "provider") return PROVIDER_NAV;
    if (role === "reception") return RECEPTION_NAV;
    return [];
  }, [role]);
}
