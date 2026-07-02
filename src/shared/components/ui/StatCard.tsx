"use client";

import React, { isValidElement } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { rf } from "@/modules/design-system/regal-frost/tokens";

function isRenderableIcon(icon: LucideIcon | React.ReactNode): icon is LucideIcon {
  if (icon == null || isValidElement(icon)) return false;
  return typeof icon === "function" || (typeof icon === "object" && "render" in icon);
}

/** Palette-aligned icon themes — no random blue/green */
export const STAT_ICON_THEMES = {
  primary: { circle: "bg-primary/10", icon: "text-primary" },
  accent: { circle: "bg-accent/15", icon: "text-accent" },
  success: { circle: "bg-success/10", icon: "text-success" },
  warning: { circle: "bg-warning/15", icon: "text-warning" },
  rose: { circle: "bg-primary/8", icon: "text-primary" },
  muted: { circle: "bg-muted", icon: "text-muted-foreground" },
  /** Legacy aliases — map to palette tokens */
  green: { circle: "bg-success/10", icon: "text-success" },
  blue: { circle: "bg-primary/10", icon: "text-primary" },
  amber: { circle: "bg-warning/15", icon: "text-warning" },
  gold: { circle: "bg-accent/15", icon: "text-accent" },
  slate: { circle: "bg-muted", icon: "text-muted-foreground" },
} as const;

export type StatIconTheme = keyof typeof STAT_ICON_THEMES;

function resolveIconTheme(theme: StatIconTheme) {
  return STAT_ICON_THEMES[theme];
}

const TREND_STYLES = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  attention: "bg-warning/15 text-warning",
} as const;

export function StatIcon({
  icon: Icon,
  theme = "primary",
  size = 20,
  className = "",
}: {
  icon: LucideIcon;
  theme?: StatIconTheme;
  size?: number;
  className?: string;
}) {
  const palette = resolveIconTheme(theme);
  return (
    <div
      className={cn(
        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
        palette.circle,
        className
      )}
    >
      <Icon size={size} className={palette.icon} strokeWidth={2} aria-hidden />
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  trendTone = "neutral",
  icon,
  iconTheme = "primary",
  index = 0,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendTone?: keyof typeof TREND_STYLES;
  /** Lucide icon or custom node */
  icon?: LucideIcon | React.ReactNode;
  iconTheme?: StatIconTheme;
  index?: number;
  className?: string;
}) {
  const delay = Math.min(index * 60, 300);

  const iconNode = !icon ? null : isRenderableIcon(icon) ? (
    <StatIcon icon={icon} theme={iconTheme} />
  ) : (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
  );

  return (
    <div
      className={cn(rf.statCard, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {iconNode}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xl font-bold tabular-nums text-primary md:text-2xl">{value}</span>
          {sub && <span className="text-xs font-medium text-muted-foreground">{sub}</span>}
        </div>
      </div>
      {trend && (
        <span
          className={cn(
            "hidden flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold sm:inline",
            TREND_STYLES[trendTone]
          )}
        >
          {trend}
        </span>
      )}
    </div>
  );
}
