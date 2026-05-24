"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, LucideIcon } from "lucide-react";

export const ADMIN_STAT_THEMES = {
  blue: { circle: "bg-blue-50", icon: "text-blue-600" },
  green: { circle: "bg-emerald-50", icon: "text-emerald-600" },
  violet: { circle: "bg-violet-50", icon: "text-violet-600" },
  amber: { circle: "bg-amber-50", icon: "text-amber-600" },
  rose: { circle: "bg-rose-50", icon: "text-rose-600" },
  slate: { circle: "bg-slate-100", icon: "text-slate-600" },
} as const;

export type AdminStatTheme = keyof typeof ADMIN_STAT_THEMES;

export function PageHeader({
  title,
  description,
  badge,
  action,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-playfair text-2xl font-bold tracking-tight text-charcoal md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
        {badge}
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
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6">
        <div>
          <h2 className="text-base font-semibold text-charcoal">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  theme = "blue",
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  theme?: AdminStatTheme;
  index?: number;
}) {
  const palette = ADMIN_STAT_THEMES[theme];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${palette.circle}`}
        >
          <Icon size={20} className={palette.icon} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-charcoal">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 className="animate-spin text-primary" size={22} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="flex-shrink-0" />
        {message}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      {Icon && <Icon size={40} className="mx-auto text-slate-300" strokeWidth={1.5} />}
      <p className={`font-semibold text-charcoal ${Icon ? "mt-4" : ""}`}>{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function CountBadge({ count, label }: { count: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
      <span className="tabular-nums">{count}</span>
      {label ?? "pending"}
    </span>
  );
}
