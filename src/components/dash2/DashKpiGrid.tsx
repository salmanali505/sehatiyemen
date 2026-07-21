import { ReactNode } from "react";
export default function DashKpiGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const map = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" } as const;
  return <div className={`grid ${map[cols]} gap-3 mb-5`}>{children}</div>;
}
