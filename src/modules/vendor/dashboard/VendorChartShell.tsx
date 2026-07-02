"use client";

import { cn } from "@/shared/lib/cn";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

export function VendorChartShell({
  children,
  yAxisLabel,
  xAxisLabel,
  footnote,
  className,
  minHeight = 320,
}: {
  children: React.ReactNode;
  yAxisLabel?: string;
  xAxisLabel?: string;
  footnote?: string;
  className?: string;
  minHeight?: number;
}) {
  return (
    <div className={cn("flex w-full flex-col", className)} style={{ minHeight }}>
      {yAxisLabel ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {yAxisLabel}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">{children}</div>
      {xAxisLabel ? (
        <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">{xAxisLabel}</p>
      ) : null}
      {footnote ? <p className={cn("mt-2 text-center", vg.caption)}>{footnote}</p> : null}
    </div>
  );
}
