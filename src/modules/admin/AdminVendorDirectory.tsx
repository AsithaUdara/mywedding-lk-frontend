"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getAdminVendors,
  type AdminVendor,
  type AdminVendorStatusFilter,
} from "@/shared/lib/api/admin";
import { ExternalLink, Loader2, Search, Store } from "lucide-react";
import { Badge, EmptyState, ErrorBanner } from "@/shared/components/ui";
import {
  AdminDataTable,
  AdminTableShell,
  AdminTd,
  AdminTh,
} from "@/modules/admin/tables";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type StatusTab = "All" | AdminVendorStatusFilter;

const STATUS_TABS: StatusTab[] = ["All", "Verified", "Pending", "Rejected"];

function formatRegisteredDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type AdminVendorDirectoryProps = {
  onVendorCount?: (count: number) => void;
};

export function AdminVendorDirectory({ onVendorCount }: AdminVendorDirectoryProps) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<StatusTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadVendors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const data = await getAdminVendors(token);
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendors.");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  const filteredVendors = useMemo(() => {
    const byStatus =
      statusTab === "All"
        ? vendors
        : vendors.filter((vendor) => vendor.verificationStatus === statusTab);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return byStatus;

    return byStatus.filter((vendor) => {
      const haystack = [
        vendor.businessName,
        vendor.ownerName,
        vendor.ownerEmail,
        vendor.city,
        vendor.categoryName,
        vendor.verificationStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [vendors, searchQuery, statusTab]);

  useEffect(() => {
    onVendorCount?.(filteredVendors.length);
  }, [filteredVendors.length, onVendorCount]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      All: vendors.length,
      Verified: 0,
      Pending: 0,
      Rejected: 0,
    };
    for (const vendor of vendors) {
      const key = vendor.verificationStatus as AdminVendorStatusFilter;
      if (key in counts) counts[key] += 1;
    }
    return counts;
  }, [vendors]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-12", vg.subtitle)}>
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Loading vendor directory…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by verification status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={statusTab === tab}
              onClick={() => setStatusTab(tab)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                statusTab === tab
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/55 bg-white/40 text-foreground hover:bg-white/55"
              )}
            >
              {tab}
              {statusCounts[tab] > 0 && (
                <span className="ml-1.5 tabular-nums text-muted-foreground">({statusCounts[tab]})</span>
              )}
            </button>
          ))}
        </div>

        <label className="relative block w-full lg:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search business, owner, city…"
            className="w-full rounded-full border border-white/55 bg-white/50 py-2.5 pl-9 pr-4 text-sm text-foreground outline-none ring-1 ring-white/60 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/20"
          />
        </label>
      </div>

      {filteredVendors.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No vendors match your search" : "No vendors in this view"}
          description={
            searchQuery
              ? "Try a different keyword or clear the search."
              : statusTab === "Verified"
                ? "Approved vendors will appear here after KYB review."
                : "Vendor registrations will appear here once submitted."
          }
        />
      ) : (
        <AdminTableShell>
          <AdminDataTable>
            <thead>
              <tr>
                <AdminTh>Business</AdminTh>
                <AdminTh>Category</AdminTh>
                <AdminTh>Location</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Services</AdminTh>
                <AdminTh>Plan</AdminTh>
                <AdminTh>Registered</AdminTh>
                <AdminTh align="right">Actions</AdminTh>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.userId} className="group">
                  <AdminTd>
                    <div className="flex items-start gap-2">
                      <Store size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{vendor.businessName}</p>
                        {vendor.ownerName && (
                          <p className={cn("mt-0.5 text-xs", vg.subtitle)}>{vendor.ownerName}</p>
                        )}
                        {vendor.ownerEmail && (
                          <a
                            href={`mailto:${vendor.ownerEmail}`}
                            className="mt-0.5 block text-xs font-medium text-primary hover:underline"
                          >
                            {vendor.ownerEmail}
                          </a>
                        )}
                      </div>
                    </div>
                  </AdminTd>
                  <AdminTd>{vendor.categoryName ?? "—"}</AdminTd>
                  <AdminTd>{vendor.city ?? "—"}</AdminTd>
                  <AdminTd>
                    <Badge variant="status" status={vendor.verificationStatus}>
                      {vendor.verificationStatus}
                    </Badge>
                  </AdminTd>
                  <AdminTd>
                    <span className="tabular-nums">{vendor.activeServiceCount}</span>
                  </AdminTd>
                  <AdminTd>
                    <Badge variant="muted">{vendor.subscriptionTier}</Badge>
                  </AdminTd>
                  <AdminTd>{formatRegisteredDate(vendor.registeredAt)}</AdminTd>
                  <AdminTd align="right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {vendor.verificationStatus === "Verified" && (
                        <GlassButton
                          href={`/vendor/${vendor.userId}`}
                          variant="ghost"
                          className="gap-1.5 px-3 py-1.5 text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} aria-hidden />
                          View storefront
                        </GlassButton>
                      )}
                      {vendor.verificationStatus === "Pending" && (
                        <GlassButton
                          href="/admin/vendors"
                          variant="primary"
                          className="px-3 py-1.5 text-xs"
                        >
                          Review in KYB
                        </GlassButton>
                      )}
                    </div>
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminDataTable>
        </AdminTableShell>
      )}

      <p className={cn("text-xs", vg.subtitle)}>
        Showing {filteredVendors.length} vendor{filteredVendors.length === 1 ? "" : "s"}
        {statusTab !== "All" ? ` · ${statusTab} only` : ""}.
        {statusTab === "All" && (
          <>
            {" "}
            <Link href="/admin/vendors" className="font-medium text-primary hover:underline">
              Open KYB queue
            </Link>{" "}
            to review pending applications.
          </>
        )}
      </p>
    </div>
  );
}
