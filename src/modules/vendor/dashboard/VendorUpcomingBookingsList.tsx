"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { VendorBookingItem } from "@/shared/lib/api/vendors";
import { formatLKR } from "@/shared/components/ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function formatServiceDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function VendorUpcomingBookingsList({
  bookings,
}: {
  bookings: VendorBookingItem[];
}) {
  if (bookings.length === 0) return null;

  return (
    <ul className="space-y-3" role="list">
      {bookings.map((booking) => (
        <li key={booking.bookingId}>
          <Link
            href="/vendor/dashboard/bookings"
            className={cn(
              "flex items-start justify-between gap-3 rounded-xl border border-white/55 bg-white/40 p-4 transition-colors",
              "hover:border-primary/25 hover:bg-white/55"
            )}
          >
            <div className="min-w-0">
              <p className={cn("font-medium", vg.body)}>{booking.serviceName}</p>
              <p className={cn("mt-0.5 truncate", vg.subtitle)}>{booking.coupleName}</p>
              <p className={cn("mt-1 flex items-center gap-1.5", vg.caption)}>
                <CalendarDays size={14} aria-hidden />
                {formatServiceDate(booking.serviceDate)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn("font-medium tabular-nums", vg.body)}>
                {formatLKR(booking.finalAmount)}
              </p>
              <p className={cn("mt-0.5", vg.caption)}>{booking.status}</p>
            </div>
            <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
