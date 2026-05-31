"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { eventWorkspace } from "./event-workspace";

interface EventStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  className?: string;
}

export function EventStatCard({ label, value, sub, icon: Icon, className }: EventStatCardProps) {
  return (
    <div className={cn(eventWorkspace.statCard, className)}>
      <div className={eventWorkspace.statIcon}>
        <Icon size={20} strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className={eventWorkspace.statLabel}>{label}</p>
        <p className={eventWorkspace.statValue}>{value}</p>
        {sub ? <p className={eventWorkspace.statSub}>{sub}</p> : null}
      </div>
    </div>
  );
}
