"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { rf } from "@/modules/design-system/regal-frost/tokens";

export type BreadcrumbItem = { label: string; href?: string };

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  action,
  className,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn(rf.panel, "px-5 py-5 sm:px-6 sm:py-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((item, i) => (
            <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-border" aria-hidden />}
              {item.href ? (
                <Link href={item.href} className="font-medium transition-colors duration-200 hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className={rf.heroTitle}>{title}</h1>
          {description && <p className={cn("mt-1.5 max-w-2xl", rf.subtitle)}>{description}</p>}
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
          {typeof badge === "string" ? <span className={rf.badge}>{badge}</span> : badge}
          {action}
        </div>
      </div>
    </header>
  );
}
