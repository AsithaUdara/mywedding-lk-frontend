"use client";

import { BarChart3 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

export function VendorChartEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-white/55 bg-white/25 px-6 py-12 text-center"
      role="status"
    >
      <BarChart3 size={32} className="mb-3 text-muted-foreground/45" aria-hidden />
      <p className={cn("font-medium text-foreground", vg.body)}>{title}</p>
      <p className={cn("mt-1 max-w-sm", vg.caption)}>{description}</p>
    </div>
  );
}
