"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  vendorUserId?: string | null;
  vendorServiceId?: string | null;
  className?: string;
};

export function VendorInsightLinks({ vendorUserId, vendorServiceId, className }: Props) {
  if (!vendorUserId) return null;

  const linkClass =
    "inline-flex items-center gap-1 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Link href={`/vendor/${vendorUserId}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <Sparkles size={12} aria-hidden />
        Vendor profile
        <ExternalLink size={11} aria-hidden />
      </Link>
      {vendorServiceId ? (
        <Link
          href={`/vendor/${vendorUserId}/services/${vendorServiceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Package details
          <ExternalLink size={11} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
