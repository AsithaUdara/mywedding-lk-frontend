"use client";

import React from "react";
import { cn } from "@/shared/lib/cn";
import { ad } from "@/modules/admin/admin-theme";

export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={ad.tableShell}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminDataTable({ children }: { children: React.ReactNode }) {
  return <table className={ad.table}>{children}</table>;
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
  return <th className={cn(ad.th, alignClass, className)}>{children}</th>;
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
  return <td className={cn(ad.td, alignClass, className)}>{children}</td>;
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
    <section className={cn(ad.panel, className)}>
      <div className={cn("flex flex-wrap items-center justify-between gap-3", ad.panelHeader)}>
        <div>
          <h2 className={ad.title}>{title}</h2>
          {subtitle && <p className={ad.subtitle}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-0">{children}</div>
    </section>
  );
}
