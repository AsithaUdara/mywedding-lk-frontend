"use client";

import { Calendar, Percent, Wallet } from "lucide-react";
import type { PayoutDueItem } from "@/shared/lib/api/admin";
import {
  formatPayoutCreatedDate,
  payoutBookingRef,
  payoutEventRef,
  payoutSettlementRef,
} from "@/modules/admin/dashboard/adminPayoutHelpers";
import { SyncPaymentStatusButton } from "@/modules/payments/SyncPaymentStatusButton";
import { PrimaryButton } from "@/modules/admin/dashboard/components";
import { formatLKR } from "@/shared/components/ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

type PayoutDueCardProps = {
  item: PayoutDueItem;
  isSettling: boolean;
  isDisabled: boolean;
  onMarkSettled: () => void;
  onPaymentSynced: () => void;
};

export function PayoutDueCard({
  item,
  isSettling,
  isDisabled,
  onMarkSettled,
  onPaymentSynced,
}: PayoutDueCardProps) {
  const commissionRate =
    item.grossAmount > 0
      ? Math.round((item.commissionAmount / item.grossAmount) * 100)
      : 0;

  return (
    <article className={glassRow}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Wallet size={16} className="shrink-0 text-primary" aria-hidden />
            <h3 className="font-semibold text-foreground">{payoutBookingRef(item.bookingId)}</h3>
            <span className={cn(rf.badge, "font-mono text-[10px]")}>
              {payoutSettlementRef(item.id)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className={vg.subtitle}>
              Event:{" "}
              <span className="font-medium font-mono text-foreground">
                {payoutEventRef(item.eventId)}
              </span>
            </span>
            <span className={cn("inline-flex items-center gap-1", vg.subtitle)}>
              <Calendar size={14} aria-hidden />
              {formatPayoutCreatedDate(item.createdAt)}
            </span>
            {commissionRate > 0 ? (
              <span className={cn("inline-flex items-center gap-1", vg.subtitle)}>
                <Percent size={14} aria-hidden />
                {commissionRate}% take rate
              </span>
            ) : null}
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className={rf.label}>Gross booking</dt>
              <dd className="mt-0.5 tabular-nums font-semibold text-foreground">
                {formatLKR(item.grossAmount)}
              </dd>
            </div>
            <div>
              <dt className={rf.label}>Vendor net due</dt>
              <dd className="mt-0.5 tabular-nums text-foreground">
                {formatLKR(item.vendorNetAmount)}
              </dd>
            </div>
            <div>
              <dt className={rf.label}>Platform commission</dt>
              <dd className="mt-0.5 tabular-nums font-semibold text-primary">
                {formatLKR(item.commissionAmount)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">
          <SyncPaymentStatusButton
            bookingId={item.bookingId}
            onSynced={onPaymentSynced}
            variant="glass"
          />
          <PrimaryButton
            onClick={onMarkSettled}
            loading={isSettling}
            disabled={isDisabled}
          >
            {isSettling ? "Saving…" : "Mark settled"}
          </PrimaryButton>
        </div>
      </div>
    </article>
  );
}
