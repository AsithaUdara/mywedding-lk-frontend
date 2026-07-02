"use client";

import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center",
        className
      )}
      role="status"
    >
      <Icon size={40} className="mx-auto text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
