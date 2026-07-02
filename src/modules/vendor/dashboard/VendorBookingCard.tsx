"use client";

import { Calendar, CheckCircle, Sparkles, User, XCircle } from "lucide-react";
import type { VendorBookingItem } from "@/shared/lib/api/vendors";
import {
  bookingStatusLabel,
  formatBookingServiceDate,
} from "@/modules/vendor/dashboard/vendorBookingHelpers";
import { VendorBookingContractUpload } from "@/modules/vendor/dashboard/VendorBookingContractUpload";
import { Badge, formatLKR } from "@/modules/vendor/dashboard/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorBookingCard({
  booking,
  actionLoading,
  onAccept,
  onDecline,
  onMarkCompleted,
  onContractUpdated,
}: {
  booking: VendorBookingItem;
  actionLoading: string | null;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onMarkCompleted: (bookingId: string) => void;
  onContractUpdated: () => void;
}) {
  const isLoading = actionLoading === booking.bookingId;

  return (
    <article
      className={cn(
        "rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm",
        "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={cn("font-medium text-foreground", vg.body, "text-base")}>
                {booking.serviceName}
              </h3>
              <p className={cn("mt-1 flex flex-wrap items-center gap-2", vg.caption)}>
                <span className="inline-flex items-center gap-1">
                  <User size={14} aria-hidden />
                  {booking.coupleName}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Sparkles size={14} aria-hidden />
                  {booking.eventName}
                </span>
              </p>
            </div>
            <Badge variant="status" status={booking.status}>
              {bookingStatusLabel(booking.status)}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={vd.metaBox}>
              <p className={vg.label}>Service date</p>
              <p className={cn("mt-1 flex items-center gap-2 font-medium", vg.body)}>
                <Calendar size={15} className="text-muted-foreground" aria-hidden />
                {formatBookingServiceDate(booking.serviceDate)}
              </p>
            </div>
            <div className={vd.metaBox}>
              <p className={vg.label}>Agreed amount</p>
              <p className="mt-1 font-semibold tabular-nums text-foreground">
                {formatLKR(booking.finalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex w-full shrink-0 flex-col gap-3",
            booking.status === "AwaitingPayment" || booking.status === "ContractSigned"
              ? "lg:min-w-[17rem] lg:max-w-md"
              : "lg:w-56"
          )}
        >
          {booking.status === "Requested" && (
            <>
              <GlassButton
                variant="primary"
                className="w-full justify-center"
                onClick={() => onAccept(booking.bookingId)}
                disabled={isLoading}
              >
                {isLoading ? "Accepting…" : "Accept"}
              </GlassButton>
              <GlassButton
                variant="ghost"
                className="w-full justify-center text-destructive hover:text-destructive"
                onClick={() => onDecline(booking.bookingId)}
                disabled={isLoading}
              >
                <XCircle size={16} aria-hidden />
                Decline
              </GlassButton>
            </>
          )}

          {booking.status === "AwaitingPayment" && (
            <div className="space-y-2">
              <VendorBookingContractUpload
                bookingId={booking.bookingId}
                contractUploaded={booking.contractUploaded}
                contractSentAt={booking.contractSentAt}
                contractSignedAt={booking.contractSignedAt}
                onUpdated={onContractUpdated}
              />
              {!booking.contractUploaded ? (
                <p className={vg.caption}>Upload the contract so the client can sign and pay.</p>
              ) : null}
            </div>
          )}

          {booking.status === "ContractSigned" && (
            <div className="space-y-2">
              <p className={vg.caption}>Contract signed — waiting for deposit.</p>
              {booking.contractFileUrl ? (
                <a
                  href={booking.contractFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold underline"
                >
                  View contract PDF
                </a>
              ) : null}
            </div>
          )}

          {booking.status === "Confirmed" && (
            <GlassButton
              variant="primary"
              className="w-full justify-center"
              onClick={() => onMarkCompleted(booking.bookingId)}
              disabled={isLoading}
            >
              <CheckCircle size={16} aria-hidden />
              {isLoading ? "Updating…" : "Mark completed"}
            </GlassButton>
          )}

          {booking.status === "Completed" && (
            <p className={vg.caption}>Service delivered.</p>
          )}

          {booking.status === "Cancelled" && (
            <p className={vg.caption}>This booking was cancelled.</p>
          )}
        </div>
      </div>
    </article>
  );
}
