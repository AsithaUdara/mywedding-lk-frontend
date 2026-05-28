"use client";

import React from "react";

/** Dense, utilitarian table primitives for admin ops screens. */
export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden border border-neutral-300 bg-white">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminDataTable({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[960px] border-collapse text-left text-xs text-neutral-900">
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
      className={`border-b border-neutral-300 bg-neutral-100 px-3 py-2 font-semibold uppercase tracking-wide text-neutral-600 ${alignClass} ${className}`}
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
    <td className={`border-b border-neutral-200 px-3 py-2 align-top ${alignClass} ${className}`}>
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
    <section className={`border border-neutral-300 bg-white ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-300 bg-neutral-50 px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-neutral-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-0">{children}</div>
    </section>
  );
}
