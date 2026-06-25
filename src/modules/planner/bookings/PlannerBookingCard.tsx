"use client";

import { ArrowRight, Calendar, ExternalLink } from "lucide-react";
import type { PlannerBookingListItem } from "@/shared/lib/api/planner";
import {
  bookingStatusLozengeClass,
  formatBookingStatusLabel,
} from "@/modules/planner/bookings/bookingStatusDisplay";
import {
  formatBookingAmount,
  formatBookingKey,
  isAwaitingPayment,
} from "@/modules/planner/bookings/plannerBookingHelpers";
import { SyncPaymentStatusButton } from "@/modules/payments/SyncPaymentStatusButton";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { paymentStatusTextClass } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type PlannerBookingCardProps = {
  booking: PlannerBookingListItem;
  onSynced: () => void;
};

export function PlannerBookingCard({ booking, onSynced }: PlannerBookingCardProps) {
  const procurementHref = `/planner/procurement?eventId=${encodeURIComponent(booking.eventId)}`;
  const showPaymentSync =
    isAwaitingPayment(booking) || booking.paymentStatus.toLowerCase() === "pending";
  const statusLabel = formatBookingStatusLabel(booking.bookingStatus);

  return (
    <article
      className={cn(
        "rounded-lg border border-[#DFE1E6] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.08)]",
        "transition-shadow duration-150 hover:shadow-[0_4px_8px_rgba(9,30,66,0.12)]"
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#5E6C84]">
              {formatBookingKey(booking.bookingId)}
            </span>
            <span
              className={cn(
                "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase leading-4",
                bookingStatusLozengeClass(booking.bookingStatus)
              )}
            >
              {statusLabel}
            </span>
          </div>

          <h3 className={cn("mt-1 font-medium text-[#172B4D]", vg.body)}>{booking.vendorName}</h3>
          <p className={cn("mt-0.5 line-clamp-1 text-sm text-[#5E6C84]", vg.subtitle)}>
            {booking.serviceName}
          </p>
          <p className={cn("mt-1 line-clamp-1 text-xs text-[#97A0AF]", vg.caption)}>
            {booking.eventName}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <span className="text-sm font-semibold tabular-nums text-[#172B4D]">
            {formatBookingAmount(booking.finalAmount)}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wide",
              paymentStatusTextClass(booking.paymentStatus)
            )}
          >
            Payment · {booking.paymentStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EBECF0] bg-[#FAFBFC] px-4 py-2.5">
        {booking.createdAt ? (
          <span className={cn("inline-flex items-center gap-1 text-[11px] text-[#5E6C84]", vg.caption)}>
            <Calendar size={12} aria-hidden />
            Requested{" "}
            {new Date(booking.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ) : (
          <span />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {showPaymentSync && (
            <SyncPaymentStatusButton
              bookingId={booking.bookingId}
              onSynced={onSynced}
              className="border-[#DFE1E6] bg-white text-xs hover:border-primary/30"
            />
          )}
          <GlassButton href={procurementHref} variant="ghost" className="gap-1 px-2.5 py-1 text-xs">
            <ExternalLink size={12} aria-hidden />
            Procurement
            <ArrowRight size={12} aria-hidden />
          </GlassButton>
        </div>
      </div>
    </article>
  );
}
