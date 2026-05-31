"use client";

import React from "react";
import { cn } from "@/shared/lib/cn";
import { rf } from "@/modules/design-system/regal-frost/tokens";

export function Card({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div className={cn(rf.panel, padding && "p-6", className)}>
      {children}
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
    <section className={cn(rf.panel, "overflow-hidden p-0", className)}>
      <div className={cn("flex flex-wrap items-start justify-between gap-3", rf.panelHeader)}>
        <div>
          <h3 className={rf.sectionTitle}>{title}</h3>
          {subtitle && <p className={cn("mt-0.5", rf.caption)}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={rf.panelBody}>{children}</div>
    </section>
  );
}
