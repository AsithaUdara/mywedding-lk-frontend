"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPendingVendors,
  rejectVendor,
  verifyVendor,
  type PendingVendor,
} from "@/shared/lib/api/admin";
import { Loader2, Mail, MapPin, Store } from "lucide-react";
import { ApproveButton, RejectButton } from "@/modules/admin/dashboard/components";
import { Badge, EmptyState, ErrorBanner } from "@/shared/components/ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const MOCK_PENDING: PendingVendor[] = [
  {
    userId: "mock-v-1",
    businessName: "Ceylon Lens Studio",
    businessDescription: "Wedding & event photography. 8 years, 200+ weddings.",
    city: "Colombo",
    categoryName: "Photography",
    ownerEmail: "hello@ceylonlens.lk",
    ownerName: "Nimal Perera",
    verificationStatus: "Pending",
  },
  {
    userId: "mock-v-2",
    businessName: "Island Bloom Florists",
    businessDescription: "Luxury floral design for destination weddings.",
    city: "Galle",
    categoryName: "Florist",
    ownerEmail: "ops@islandbloom.lk",
    ownerName: "Tharushi Wick",
    verificationStatus: "Pending",
  },
  {
    userId: "mock-v-3",
    businessName: "Rhythm DJ Collective",
    businessDescription: null,
    city: "Kandy",
    categoryName: "Entertainment",
    ownerEmail: "bookings@rhythmdj.lk",
    ownerName: "Kasun Jayawardena",
    verificationStatus: "Pending",
  },
];

type ActionState = { id: string; type: "approve" | "reject" } | null;

type VendorApprovalQueueProps = {
  mockOnly?: boolean;
  /** Dashboard embed — fewer rows, compact columns */
  embedded?: boolean;
  /** @deprecated Use embedded */
  compact?: boolean;
  onPendingCount?: (count: number) => void;
};

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

export function VendorApprovalQueue({
  mockOnly = false,
  embedded = false,
  compact = false,
  onPendingCount,
}: VendorApprovalQueueProps) {
  const isEmbedded = embedded || compact;
  const { user } = useAuth();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setAction] = useState<ActionState>(null);
  const [useMock, setUseMock] = useState(mockOnly);

  const loadVendors = useCallback(async () => {
    if (mockOnly) {
      setVendors(MOCK_PENDING);
      setUseMock(true);
      setLoading(false);
      return;
    }
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const data = await getPendingVendors(token);
      if (data.length === 0) {
        setVendors(MOCK_PENDING);
        setUseMock(true);
      } else {
        setVendors(data);
        setUseMock(false);
      }
    } catch {
      setVendors(MOCK_PENDING);
      setUseMock(true);
      setError("Live API unavailable — showing mock KYB queue.");
    } finally {
      setLoading(false);
    }
  }, [user, mockOnly]);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    onPendingCount?.(vendors.length);
  }, [vendors.length, onPendingCount]);

  const displayVendors = useMemo(() => {
    return isEmbedded ? vendors.slice(0, 4) : vendors;
  }, [vendors, isEmbedded]);

  const removeVendor = (vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.userId !== vendorId));
  };

  const handleApprove = async (vendorId: string) => {
    if (useMock && vendorId.startsWith("mock-")) {
      removeVendor(vendorId);
      return;
    }
    if (!user) return;
    setAction({ id: vendorId, type: "approve" });
    setError(null);
    try {
      const token = await user.getIdToken();
      await verifyVendor(token, vendorId);
      removeVendor(vendorId);
    } catch {
      setError("Failed to approve vendor.");
    } finally {
      setAction(null);
    }
  };

  const handleReject = async (vendorId: string, businessName: string) => {
    const confirmed = window.confirm(
      `Reject "${businessName}"? Vendor will not appear in the directory.`
    );
    if (!confirmed) return;

    if (useMock && vendorId.startsWith("mock-")) {
      removeVendor(vendorId);
      return;
    }
    if (!user) return;
    setAction({ id: vendorId, type: "reject" });
    setError(null);
    try {
      const token = await user.getIdToken();
      await rejectVendor(token, vendorId);
      removeVendor(vendorId);
    } catch {
      setError("Failed to reject vendor.");
    } finally {
      setAction(null);
    }
  };

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
      {useMock && !mockOnly && !error && (
        <p className="rounded-xl border border-white/55 bg-white/35 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur-sm">
          Demo data — connect backend or submit real vendor signups.
        </p>
      )}

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
                <article className={glassRow}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Store size={16} className="shrink-0 text-primary" aria-hidden />
                            <h3 className="font-semibold text-foreground">{vendor.businessName}</h3>
                            <Badge variant="status" status={vendor.verificationStatus}>
                              {vendor.verificationStatus}
                            </Badge>
                          </div>
                          {!isEmbedded && vendor.businessDescription && (
                            <p className={cn("mt-2 max-w-2xl", vg.subtitle)}>
                              {vendor.businessDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className={vg.subtitle}>
                          Owner:{" "}
                          <span className="font-medium text-foreground">
                            {vendor.ownerName ?? "—"}
                          </span>
                        </span>
                        {!isEmbedded && vendor.city && (
                          <span className={cn("inline-flex items-center gap-1", vg.subtitle)}>
                            <MapPin size={14} aria-hidden />
                            {vendor.city}
                          </span>
                        )}
                        {!isEmbedded && vendor.categoryName && (
                          <Badge variant="muted">{vendor.categoryName}</Badge>
                        )}
                      </div>

                      {!isEmbedded && vendor.ownerEmail && (
                        <a
                          href={`mailto:${vendor.ownerEmail}`}
                          className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline")}
                        >
                          <Mail size={14} aria-hidden />
                          {vendor.ownerEmail}
                        </a>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 lg:pt-1">
                      <ApproveButton
                        onClick={() => void handleApprove(vendor.userId)}
                        loading={isApproving}
                        disabled={isActing && !isApproving}
                      />
                      <RejectButton
                        onClick={() => void handleReject(vendor.userId, vendor.businessName)}
                        loading={isRejecting}
                        disabled={isActing && !isRejecting}
                      />
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {isEmbedded && vendors.length > 4 && (
        <p className={cn("text-center text-sm", vg.subtitle)}>
          Showing 4 of {vendors.length} pending — open the full queue to review all.
        </p>
      )}
    </div>
  );
}
