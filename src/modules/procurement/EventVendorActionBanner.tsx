"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useEventVendorPendingActions } from "@/shared/hooks/useEventVendorPendingActions";
import { useEventPermission } from "@/shared/hooks/useEventPermission";
import { cn } from "@/shared/lib/cn";

type Props = {
  eventId: string;
  className?: string;
};

export function EventVendorActionBanner({ eventId, className }: Props) {
  const { isViewer, loading: permissionLoading } = useEventPermission(eventId);
  const {
    loading,
    pendingReview,
    awaitingContractSignature,
    awaitingDeposit,
    totalPending,
  } = useEventVendorPendingActions(eventId);

  if (permissionLoading || loading || isViewer || totalPending === 0) {
    return null;
  }

  const message =
    pendingReview > 0
      ? `${pendingReview} vendor proposal${pendingReview === 1 ? "" : "s"} waiting for your approval.`
      : awaitingContractSignature > 0
      ? `${awaitingContractSignature} vendor contract${awaitingContractSignature === 1 ? "" : "s"} ready for your signature.`
      : `${awaitingDeposit} vendor deposit${awaitingDeposit === 1 ? "" : "s"} ready to pay.`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-amber-950 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Action needed on vendor proposals</p>
          <p className="mt-0.5 text-sm text-amber-900/90">{message}</p>
        </div>
      </div>
      <Link
        href={`/events/${eventId}/vendors`}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Review vendors
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
