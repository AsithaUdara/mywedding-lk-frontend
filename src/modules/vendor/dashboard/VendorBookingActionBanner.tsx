"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  className?: string;
  requestedCount: number;
  loading: boolean;
};

export function VendorBookingActionBanner({
  className,
  requestedCount,
  loading,
}: Props) {
  if (loading || !requestedCount) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-amber-950 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold">New booking request{requestedCount === 1 ? "" : "s"}</p>
          <p className="mt-0.5 text-sm text-amber-900/90">
            {requestedCount} couple request{requestedCount === 1 ? "" : "s"} waiting for your response.
          </p>
        </div>
      </div>
      <Link
        href="/vendor/dashboard/bookings"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Review bookings
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
