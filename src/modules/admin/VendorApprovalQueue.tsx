"use client";

import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useKybQueue } from "@/modules/admin/hooks/useKybQueue";
import { KybVendorCard } from "@/modules/admin/components/KybVendorCard";
import { EmptyState, ErrorBanner } from "@/shared/components/ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type VendorApprovalQueueProps = {
  /** Dashboard embed — fewer rows, compact layout */
  embedded?: boolean;
  /** @deprecated Use embedded */
  compact?: boolean;
  onPendingCount?: (count: number) => void;
};

export function VendorApprovalQueue({
  embedded = false,
  compact = false,
  onPendingCount,
}: VendorApprovalQueueProps) {
  const isEmbedded = embedded || compact;
  const { vendors, loading, error, actionState, approve, reject } = useKybQueue();

  const displayVendors = useMemo(() => {
    return isEmbedded ? vendors.slice(0, 3) : vendors;
  }, [vendors, isEmbedded]);

  useEffect(() => {
    onPendingCount?.(vendors.length);
  }, [vendors.length, onPendingCount]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-12", vg.subtitle)}>
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Loading KYB queue…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      {displayVendors.length === 0 ? (
        <EmptyState
          title="No vendors awaiting review"
          description="New vendor applications will appear here for KYB approval."
        />
      ) : (
        <ul className="space-y-3" role="list">
          {displayVendors.map((vendor) => {
            const isActing = actionState?.id === vendor.userId;
            const isApproving = isActing && actionState?.type === "approve";
            const isRejecting = isActing && actionState?.type === "reject";

            return (
              <li key={vendor.userId}>
                <KybVendorCard
                  vendor={vendor}
                  embedded={isEmbedded}
                  isApproving={isApproving}
                  isRejecting={isRejecting}
                  isActing={isActing}
                  onApprove={() => void approve(vendor.userId)}
                  onReject={() => void reject(vendor.userId, vendor.businessName)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {isEmbedded && vendors.length > 3 && (
        <p className={cn("text-center text-sm", vg.subtitle)}>
          Showing 3 of {vendors.length} pending — open the full queue to review all.
        </p>
      )}
    </div>
  );
}
