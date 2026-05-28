"use client";

import React from "react";

export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white/50">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminDataTable({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[960px] border-collapse text-left text-sm text-charcoal">
      {children}
    </table>
  );
}

export function AdminTh({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th
      className={`border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 ${alignClass} ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td
      className={`border-b border-slate-50 px-5 py-4 align-top transition-colors duration-300 ease-in-out ${alignClass} ${className}`}
    >
      {children}
    </td>
  );
}

export function AdminPanel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[2rem] border border-white/20 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/80 px-6 py-5 sm:px-8">
        <div>
          <h2 className="font-playfair text-xl font-bold tracking-tight text-charcoal sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-0">{children}</div>
    </section>
  );
}
