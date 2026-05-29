"use client";

import React from "react";
import { cn } from "@/shared/lib/cn";
import { getStatusBadgeClass } from "./status";

type BadgeVariant = "status" | "default" | "accent" | "muted" | "destructive";

const variantStyles: Record<Exclude<BadgeVariant, "status">, string> = {
  default: "bg-primary/10 text-primary border border-primary/20",
  accent: "bg-accent/15 text-accent-foreground border border-accent/30",
  muted: "bg-muted text-muted-foreground border border-border",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20",
};

export function Badge({
  children,
  variant = "default",
  status,
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** When set, uses semantic STATUS_BADGE_STYLES map */
  status?: string;
  className?: string;
}) {
  const style =
    variant === "status" && status
      ? getStatusBadgeClass(status)
      : variantStyles[variant === "status" ? "default" : variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        style,
        className
      )}
    >
      {children}
    </span>
  );
}

/** @deprecated Use Badge with status prop */
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="status" status={status}>{status}</Badge>;
}
