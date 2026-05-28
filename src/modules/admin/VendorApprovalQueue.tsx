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
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900/90 transition-all duration-300 ease-in-out">
            {vendors.length} pending
          </span>
        ) : null
      }
    >
      {error && (
        <div className="border-b border-amber-200/80 bg-amber-50/90 px-6 py-3 text-sm text-amber-900/90 sm:px-8">
          {error}
        </div>
      )}
      {useMock && !mockOnly && !error && (
        <div className="border-b border-slate-100/80 bg-slate-50/80 px-6 py-2.5 text-sm text-slate-500 sm:px-8">
          Demo data — connect backend or submit real vendor signups to populate live queue.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Loading KYB queue…
        </div>
      ) : vendors.length === 0 ? (
        <div className="px-8 py-16 text-center text-sm text-slate-500">
          No vendors awaiting KYB review.
        </div>
      ) : (
        <div className="px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
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
                  <tr
                    key={vendor.userId}
                    className="transition-colors duration-300 ease-in-out hover:bg-slate-50/80"
                  >
                    <AdminTd>
                      <p className="font-semibold text-charcoal">{vendor.businessName}</p>
                      <p className="mt-1 line-clamp-2 max-w-xs text-sm leading-relaxed text-slate-500">
                        {vendor.businessDescription ?? "—"}
                      </p>
                    </AdminTd>
                    <AdminTd>
                      <span className="text-charcoal">{vendor.ownerName ?? "—"}</span>
                    </AdminTd>
                    <AdminTd>
                      {vendor.ownerEmail ? (
                        <a
                          href={`mailto:${vendor.ownerEmail}`}
                          className="text-violet-800/90 underline-offset-2 transition-all duration-300 ease-in-out hover:text-violet-950 hover:underline"
                        >
                          {vendor.ownerEmail}
                        </a>
                      ) : (
                        "—"
                      )}
                    </AdminTd>
                    <AdminTd>{vendor.city ?? "—"}</AdminTd>
                    <AdminTd>
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {vendor.categoryName ?? "Uncategorized"}
                      </span>
                    </AdminTd>
                    <AdminTd>
                      <span className="inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900/90">
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
        </div>
      )}
    </AdminPanel>
  );
}
