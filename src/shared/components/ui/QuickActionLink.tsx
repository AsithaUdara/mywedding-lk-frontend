"use client";

import React from "react";
import Link from "next/link";

export function QuickActionLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 transition-all duration-200 hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon && (
        <div className="rounded-xl bg-card p-2 text-primary shadow-sm transition-shadow duration-200 group-hover:shadow-md">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
          {label}
        </p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Link>
  );
}
