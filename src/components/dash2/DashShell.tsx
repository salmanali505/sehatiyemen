import { ReactNode, useState } from "react";
import DashSidebar from "./DashSidebar";
import DashTopBar from "./DashTopBar";
import type { DashNavItem } from "@/lib/dash/permissions";

type Props = {
  role: "admin" | "provider" | "reception";
  title: string;
  menuItems: DashNavItem[];
  children: ReactNode;
};

const roleTitle: Record<Props["role"], string> = {
  admin: "الإدارة العليا",
  provider: "لوحة المنشأة",
  reception: "الاستقبال",
};

export default function DashShell({ role, title, menuItems, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DashSidebar
        items={menuItems}
        title={title ?? roleTitle[role]}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashTopBar onOpenMenu={() => setMobileOpen(true)} menuItems={menuItems} />
        <main className="flex-1 p-4 md:p-6 max-w-[1500px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
