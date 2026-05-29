"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPendingVendors,
  rejectVendor,
  verifyVendor,
  type PendingVendor,
} from "@/shared/lib/api/admin";
import { Loader2 } from "lucide-react";
import { ApproveButton, RejectButton } from "@/modules/admin/dashboard/components";
import {
  Badge,
  DataTable,
  type DataTableColumn,
  EmptyState,
  ErrorBanner,
} from "@/shared/components/ui";
import { ad } from "@/modules/admin/admin-theme";

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

type Row = PendingVendor & { id: string };

type ActionState = { id: string; type: "approve" | "reject" } | null;

type VendorApprovalQueueProps = {
  mockOnly?: boolean;
  /** Dashboard embed — fewer rows, compact columns */
  embedded?: boolean;
  /** @deprecated Use embedded */
  compact?: boolean;
  onPendingCount?: (count: number) => void;
};

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

  const rows: Row[] = useMemo(() => {
    const mapped = vendors.map((v) => ({ ...v, id: v.userId }));
    return isEmbedded ? mapped.slice(0, 4) : mapped;
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

  const columns = useMemo((): DataTableColumn<Row>[] => {
    const base: DataTableColumn<Row>[] = [
      {
        key: "business",
        header: "Business",
        render: (vendor) => (
          <div className="min-w-[200px]">
            <p className="font-semibold text-foreground">{vendor.businessName}</p>
            {!isEmbedded && (
              <p className="mt-1 line-clamp-2 max-w-sm text-sm text-muted-foreground">
                {vendor.businessDescription ?? "—"}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "owner",
        header: "Owner",
        render: (vendor) => <span className="text-foreground">{vendor.ownerName ?? "—"}</span>,
      },
    ];

    if (!isEmbedded) {
      base.push(
        {
          key: "email",
          header: "Email",
          render: (vendor) =>
            vendor.ownerEmail ? (
              <a
                href={`mailto:${vendor.ownerEmail}`}
                className="font-medium text-primary hover:underline"
              >
                {vendor.ownerEmail}
              </a>
            ) : (
              "—"
            ),
        },
        {
          key: "city",
          header: "City",
          render: (vendor) => vendor.city ?? "—",
        },
        {
          key: "category",
          header: "Category",
          render: (vendor) => (
            <Badge variant="muted">{vendor.categoryName ?? "Uncategorized"}</Badge>
          ),
        }
      );
    }

    base.push(
      {
        key: "status",
        header: "Status",
        render: (vendor) => <Badge variant="accent">{vendor.verificationStatus}</Badge>,
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (vendor) => {
          const isActing = actionState?.id === vendor.userId;
          const isApproving = isActing && actionState?.type === "approve";
          const isRejecting = isActing && actionState?.type === "reject";
          return (
            <div className="flex items-center justify-end gap-1.5">
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
          );
        },
      }
    );

    return base;
  }, [isEmbedded, actionState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Loading KYB queue…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {useMock && !mockOnly && !error && (
        <p className={cnDemoBanner()}>Demo data — connect backend or submit real vendor signups.</p>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        emptyTitle="No vendors awaiting review"
        emptyDescription="New vendor applications will appear here for KYB approval."
      />

      {isEmbedded && vendors.length > 4 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing 4 of {vendors.length} pending — open the full queue to review all.
        </p>
      )}
    </div>
  );
}

function cnDemoBanner() {
  return `${ad.demoBanner} rounded-xl border border-border px-4 py-2.5`;
}
