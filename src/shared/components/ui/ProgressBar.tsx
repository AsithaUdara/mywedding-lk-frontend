"use client";

import React from "react";
import { cn } from "@/shared/lib/cn";

export function ProgressBar({
  label,
  count,
  total,
  barClassName = "bg-primary",
  /** @deprecated Use barClassName */
  color,
}: {
  label: string;
  count: number;
  total: number;
  barClassName?: string;
  color?: string;
}) {
  const barClass = barClassName ?? color ?? "bg-primary";
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground tabular-nums">
          {count} <span className="font-normal text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barClass)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
