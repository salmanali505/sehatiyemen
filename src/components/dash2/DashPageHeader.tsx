import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, type LucideIcon } from "lucide-react";

type Crumb = { label: string; to?: string };

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  crumbs?: Crumb[];
  actions?: ReactNode;
};

export default function DashPageHeader({ title, subtitle, icon: Icon, crumbs, actions }: Props) {
  return (
    <header className="mb-5">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronLeft size={12} className="opacity-60" />}
              {c.to ? <Link to={c.to as any} className="hover:text-primary">{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {Icon && (
          <div className="w-11 h-11 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center shadow-glow shrink-0">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-black leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
