"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPendingVendors,
  rejectVendor,
  verifyVendor,
  type PendingVendor,
} from "@/shared/lib/api/admin";
import { Loader2 } from "lucide-react";
import { ApproveButton, RejectButton } from "@/modules/admin/dashboard/components";
import { AdminDataTable, AdminPanel, AdminTableShell, AdminTd, AdminTh } from "./tables";

/** Fallback rows when API is empty — demo KYB queue for local dev. */
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
  /** Use mock data only (no API). */
  mockOnly?: boolean;
  compact?: boolean;
};

export function VendorApprovalQueue({ mockOnly = false, compact = false }: VendorApprovalQueueProps) {
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
    loadVendors();
  }, [loadVendors]);

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
    const confirmed = window.confirm(`Reject "${businessName}"? Vendor will not appear in the directory.`);
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

  return (
    <AdminPanel
      title="Vendor approval queue (KYB)"
      subtitle={
        compact
          ? "Know-your-business verification before directory listing"
          : "Review business details, portfolio, and web presence — approve to verify or reject application"
      }
      action={
        !loading && vendors.length > 0 ? (
          <span className="border border-amber-400 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
            {vendors.length} pending
          </span>
        ) : null
      }
    >
      {error && (
        <div className="border-b border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">{error}</div>
      )}
      {useMock && !mockOnly && !error && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] text-neutral-600">
          Demo data — connect backend or submit real vendor signups to populate live queue.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-xs text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Loading KYB queue…
        </div>
      ) : vendors.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs text-neutral-500">
          No vendors awaiting KYB review.
        </div>
      ) : (
        <AdminTableShell>
          <AdminDataTable>
            <thead>
              <tr>
                <AdminTh>Business</AdminTh>
                <AdminTh>Owner</AdminTh>
                <AdminTh>Email</AdminTh>
                <AdminTh>City</AdminTh>
                <AdminTh>Category</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh align="right">Actions</AdminTh>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => {
                const isActing = actionState?.id === vendor.userId;
                const isApproving = isActing && actionState?.type === "approve";
                const isRejecting = isActing && actionState?.type === "reject";

                return (
                  <tr key={vendor.userId} className="hover:bg-neutral-50">
                    <AdminTd>
                      <p className="font-semibold text-neutral-900">{vendor.businessName}</p>
                      <p className="mt-0.5 line-clamp-2 max-w-xs text-[11px] leading-snug text-neutral-500">
                        {vendor.businessDescription ?? "—"}
                      </p>
                    </AdminTd>
                    <AdminTd>
                      <span className="text-neutral-800">{vendor.ownerName ?? "—"}</span>
                    </AdminTd>
                    <AdminTd>
                      {vendor.ownerEmail ? (
                        <a href={`mailto:${vendor.ownerEmail}`} className="text-blue-700 hover:underline">
                          {vendor.ownerEmail}
                        </a>
                      ) : (
                        "—"
                      )}
                    </AdminTd>
                    <AdminTd>{vendor.city ?? "—"}</AdminTd>
                    <AdminTd>
                      <span className="inline-block border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium">
                        {vendor.categoryName ?? "Uncategorized"}
                      </span>
                    </AdminTd>
                    <AdminTd>
                      <span className="inline-block border border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                        {vendor.verificationStatus}
                      </span>
                    </AdminTd>
                    <AdminTd align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ApproveButton
                          onClick={() => handleApprove(vendor.userId)}
                          loading={isApproving}
                          disabled={isActing && !isApproving}
                        />
                        <RejectButton
                          onClick={() => handleReject(vendor.userId, vendor.businessName)}
                          loading={isRejecting}
                          disabled={isActing && !isRejecting}
                        />
                      </div>
                    </AdminTd>
                  </tr>
                );
              })}
            </tbody>
          </AdminDataTable>
        </AdminTableShell>
      )}
    </AdminPanel>
  );
}
