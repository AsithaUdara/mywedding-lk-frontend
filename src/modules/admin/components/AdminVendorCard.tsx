"use client";

import { ExternalLink, Mail, MapPin, Package, Star, Store } from "lucide-react";
import type { AdminVendor } from "@/shared/lib/api/admin";
import {
  adminVendorRef,
  formatVendorRegisteredDate,
  vendorHasLiveListing,
} from "@/modules/admin/dashboard/adminVendorDirectoryHelpers";
import { Badge } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

export function AdminVendorCard({ vendor }: { vendor: AdminVendor }) {
  const isLive = vendorHasLiveListing(vendor);

  return (
    <article className={glassRow}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Store size={16} className="shrink-0 text-primary" aria-hidden />
            <h3 className="font-semibold text-foreground">{vendor.businessName}</h3>
            <Badge variant="status" status={vendor.verificationStatus}>
              {vendor.verificationStatus}
            </Badge>
            {isLive ? (
              <Badge variant="muted">Live on marketplace</Badge>
            ) : vendor.verificationStatus === "Verified" ? (
              <Badge variant="muted">No active services</Badge>
            ) : null}
          </div>

          <p className={cn("font-mono text-xs", vg.caption)}>{adminVendorRef(vendor.userId)}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {vendor.ownerName ? (
              <span className={vg.subtitle}>
                Owner:{" "}
                <span className="font-medium text-foreground">{vendor.ownerName}</span>
              </span>
            ) : null}
            {vendor.city ? (
              <span className={cn("inline-flex items-center gap-1", vg.subtitle)}>
                <MapPin size={14} aria-hidden />
                {vendor.city}
              </span>
            ) : null}
            {vendor.categoryName ? <Badge variant="muted">{vendor.categoryName}</Badge> : null}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Package size={14} aria-hidden />
              <span className="tabular-nums">{vendor.activeServiceCount}</span> active service
              {vendor.activeServiceCount === 1 ? "" : "s"}
            </span>
            {vendor.averageRating > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="text-accent" aria-hidden />
                <span className="tabular-nums">{vendor.averageRating.toFixed(1)}</span> avg rating
              </span>
            ) : null}
            <span>Joined {formatVendorRegisteredDate(vendor.registeredAt)}</span>
          </div>

          {vendor.ownerEmail ? (
            <a
              href={`mailto:${vendor.ownerEmail}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Mail size={14} aria-hidden />
              {vendor.ownerEmail}
            </a>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">
          {vendor.verificationStatus === "Verified" && (
            <GlassButton
              href={`/vendor/${vendor.userId}`}
              variant="ghost"
              className="gap-1.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} aria-hidden />
              Storefront
            </GlassButton>
          )}
          {vendor.verificationStatus === "Pending" && (
            <GlassButton href="/admin/vendors" variant="primary">
              Review in KYB
            </GlassButton>
          )}
          {vendor.verificationStatus === "Rejected" && (
            <span className={cn("text-xs", vg.caption)}>Blocked from marketplace</span>
          )}
        </div>
      </div>
    </article>
  );
}
