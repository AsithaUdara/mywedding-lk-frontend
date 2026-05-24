"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPendingVendors,
  verifyVendor,
  rejectVendor,
  PendingVendor,
} from "@/shared/lib/api/admin";
import { CheckCircle, Store, MapPin, Tag, Mail, User } from "lucide-react";
import {
  CountBadge,
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeader,
  SectionCard,
} from "@/modules/admin/dashboard/ui";
import { ApproveButton, RejectButton } from "@/modules/admin/dashboard/components";
import {
  DataTable,
  TableShell,
  Td,
  Th,
} from "@/modules/vendor/dashboard/components";

type ActionState = { id: string; type: "approve" | "reject" } | null;

export default function AdminPendingVendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setAction] = useState<ActionState>(null);

  const loadVendors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      setVendors(await getPendingVendors(token));
    } catch {
      setError("Failed to load pending vendor applications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const handleApprove = async (vendorId: string) => {
    if (!user) return;
    setAction({ id: vendorId, type: "approve" });
    setError(null);
    try {
      const token = await user.getIdToken();
      await verifyVendor(token, vendorId);
      setVendors((prev) => prev.filter((v) => v.userId !== vendorId));
    } catch {
      setError("Failed to approve vendor. Please try again.");
    } finally {
      setAction(null);
    }
  };

  const handleReject = async (vendorId: string, businessName: string) => {
    if (!user) return;
    const confirmed = window.confirm(
      `Reject "${businessName}"? The vendor will not appear on the marketplace.`
    );
    if (!confirmed) return;

    setAction({ id: vendorId, type: "reject" });
    setError(null);
    try {
      const token = await user.getIdToken();
      await rejectVendor(token, vendorId);
      setVendors((prev) => prev.filter((v) => v.userId !== vendorId));
    } catch {
      setError("Failed to reject vendor. Please try again.");
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending vendors"
        description="Review new vendor applications before they appear to couples on search and listings."
        badge={
          !loading && vendors.length > 0 ? (
            <CountBadge count={vendors.length} label="awaiting review" />
          ) : undefined
        }
      />

      {error && <ErrorBanner message={error} />}

      <SectionCard
        title="Application queue"
        subtitle="Approve to publish on the marketplace, or reject to decline the application"
      >
        {loading ? (
          <LoadingState label="Loading applications..." />
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All caught up"
            description="There are no vendor applications waiting for review right now."
          />
        ) : (
          <TableShell>
            <DataTable>
              <thead>
                <tr>
                  <Th>Business</Th>
                  <Th>Owner</Th>
                  <Th>Contact</Th>
                  <Th>Location</Th>
                  <Th>Category</Th>
                  <Th align="right">Decision</Th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => {
                  const isActing = actionState?.id === vendor.userId;
                  const isApproving = isActing && actionState?.type === "approve";
                  const isRejecting = isActing && actionState?.type === "reject";

                  return (
                    <tr key={vendor.userId} className="align-top hover:bg-slate-50/80">
                      <Td>
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-primary">
                            <Store size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal">{vendor.businessName}</p>
                            {vendor.businessDescription ? (
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {vendor.businessDescription}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-slate-400">No description provided</p>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {vendor.ownerName ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                            <User size={14} className="text-slate-400" />
                            {vendor.ownerName}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </Td>
                      <Td>
                        {vendor.ownerEmail ? (
                          <a
                            href={`mailto:${vendor.ownerEmail}`}
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="max-w-[180px] truncate">{vendor.ownerEmail}</span>
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </Td>
                      <Td>
                        {vendor.city ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <MapPin size={14} className="text-slate-400" />
                            {vendor.city}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </Td>
                      <Td>
                        {vendor.categoryName ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            <Tag size={12} className="mr-1 text-slate-400" />
                            {vendor.categoryName}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-2">
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
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </TableShell>
        )}
      </SectionCard>
    </div>
  );
}
