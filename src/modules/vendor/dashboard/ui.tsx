"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, LucideIcon } from "lucide-react";

/** Pastel circle + colored icon — matches couple event dashboard QuickInsightsRow */
export const STAT_ICON_THEMES = {
  primary: { circle: "bg-primary/10", icon: "text-primary" },
  green: { circle: "bg-green-50", icon: "text-green-600" },
  blue: { circle: "bg-blue-50", icon: "text-blue-600" },
  amber: { circle: "bg-amber-50", icon: "text-amber-600" },
  rose: { circle: "bg-rose-50", icon: "text-rose-600" },
  slate: { circle: "bg-slate-100", icon: "text-slate-600" },
  gold: { circle: "bg-amber-100", icon: "text-amber-700" },
} as const;

export type StatIconTheme = keyof typeof STAT_ICON_THEMES;

export function IconCircle({
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
  const palette = STAT_ICON_THEMES[theme];
  return (
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${palette.circle} ${className}`}
    >
      <Icon size={size} className={palette.icon} strokeWidth={2} />
    </div>
  );
}

export function formatLKR(amount: number) {
  if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `LKR ${(amount / 1_000).toFixed(0)}K`;
  return `LKR ${amount.toLocaleString()}`;
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="mr-3 animate-spin" size={24} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} />
        {message}
      </div>
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-semibold text-charcoal">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  badge,
  action,
}: {
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-playfair text-2xl font-bold tracking-tight text-charcoal md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
        {badge && (
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            {badge}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 ${className ?? ""}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-charcoal">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

const TREND_STYLES = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-primary/10 text-primary",
  attention: "bg-amber-50 text-amber-700",
} as const;

export function StatCard({
  label,
  value,
  sub,
  trend,
  trendTone = "neutral",
  icon: Icon,
  iconTheme = "primary",
  index = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendTone?: keyof typeof TREND_STYLES;
  icon: LucideIcon;
  iconTheme?: StatIconTheme;
  index?: number;
}) {
  const palette = STAT_ICON_THEMES[iconTheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${palette.circle}`}
      >
        <Icon size={20} className={palette.icon} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xl font-bold text-charcoal">{value}</span>
          {sub && <span className="text-xs font-medium text-gray-500">{sub}</span>}
        </div>
      </div>
      {trend && (
        <span
          className={`hidden flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold sm:inline ${TREND_STYLES[trendTone]}`}
        >
          {trend}
        </span>
      )}
    </motion.div>
  );
}

export function ProgressBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-charcoal">
          {count} <span className="font-normal text-slate-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
