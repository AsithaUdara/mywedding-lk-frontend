"use client";

import { AlertTriangle, Mail, MapPin, Store } from "lucide-react";
import type { PendingVendor } from "@/shared/lib/api/admin";
import {
  kybReviewFlags,
  kybVendorRef,
} from "@/modules/admin/dashboard/adminKybHelpers";
import { ApproveButton, RejectButton } from "@/modules/admin/dashboard/components";
import { Badge } from "@/shared/components/ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type KybVendorCardProps = {
  vendor: PendingVendor;
  embedded?: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  isActing: boolean;
  onApprove: () => void;
  onReject: () => void;
};

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

export function KybVendorCard({
  vendor,
  embedded = false,
  isApproving,
  isRejecting,
  isActing,
  onApprove,
  onReject,
}: KybVendorCardProps) {
  const flags = kybReviewFlags(vendor);

  return (
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
              <p className={cn("mt-1 font-mono text-xs", vg.caption)}>
                {kybVendorRef(vendor.userId)}
              </p>
              {!embedded && vendor.businessDescription ? (
                <p className={cn("mt-2 max-w-2xl", vg.subtitle)}>{vendor.businessDescription}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className={vg.subtitle}>
              Owner:{" "}
              <span className="font-medium text-foreground">{vendor.ownerName ?? "—"}</span>
            </span>
            {vendor.city ? (
              <span className={cn("inline-flex items-center gap-1", vg.subtitle)}>
                <MapPin size={14} aria-hidden />
                {vendor.city}
              </span>
            ) : null}
            {vendor.categoryName ? <Badge variant="muted">{vendor.categoryName}</Badge> : null}
          </div>

          {!embedded && vendor.ownerEmail ? (
            <a
              href={`mailto:${vendor.ownerEmail}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Mail size={14} aria-hidden />
              {vendor.ownerEmail}
            </a>
          ) : null}

          {flags.length > 0 && (
            <ul className="flex flex-wrap gap-2" role="list">
              {flags.map((flag) => (
                <li
                  key={flag.id}
                  className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"
                >
                  <AlertTriangle size={12} aria-hidden />
                  {flag.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:pt-1">
          <ApproveButton
            onClick={onApprove}
            loading={isApproving}
            disabled={isActing && !isApproving}
          />
          <RejectButton
            onClick={onReject}
            loading={isRejecting}
            disabled={isActing && !isRejecting}
          />
        </div>
      </div>
    </article>
  );
}
