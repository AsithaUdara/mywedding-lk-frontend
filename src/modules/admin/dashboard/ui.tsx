"use client";

/**
 * Admin dashboard UI — re-exports shared design system primitives.
 */
import { StatCard as SharedStatCard } from "@/shared/components/ui";
import type { StatIconTheme } from "@/shared/components/ui";
import type { LucideIcon } from "lucide-react";

export {
  Button,
  Badge,
  PageHeader,
  SectionCard,
  StatCard,
  StatIcon,
  STAT_ICON_THEMES,
  type StatIconTheme,
  LoadingState,
  ErrorBanner,
  EmptyState,
  PageLoadingSkeleton,
  formatLKR,
  inputClass,
} from "@/shared/components/ui";

/** Admin KPI themes — palette-aligned (no random blue/violet) */
export const ADMIN_STAT_THEMES = {
  primary: "primary",
  accent: "accent",
  success: "success",
  warning: "warning",
  rose: "rose",
  muted: "muted",
} as const satisfies Record<string, StatIconTheme>;

export type AdminStatTheme = keyof typeof ADMIN_STAT_THEMES;

/** @deprecated Use StatCard with iconTheme */
export function AdminStatCard({
  label,
  value,
  icon,
  theme = "primary",
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  theme?: AdminStatTheme;
  index?: number;
}) {
  return (
    <SharedStatCard label={label} value={value} icon={icon} iconTheme={theme} index={index} />
  );
}

export function CountBadge({ count, label }: { count: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-foreground">
      <span className="tabular-nums">{count}</span>
      {label ?? "pending"}
    </span>
  );
}
