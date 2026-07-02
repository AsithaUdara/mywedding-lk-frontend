"use client";

import Image from "next/image";
import { Package, Pencil, Tag } from "lucide-react";
import type { VendorService } from "@/modules/vendor/dashboard/vendorServiceHelpers";
import {
  IconButton,
  InlineSpinner,
  RowActionsMenu,
  StatusBadge,
  ToggleSwitch,
} from "@/modules/vendor/dashboard/components";
import { formatLKR, StatIcon } from "@/modules/vendor/dashboard/ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorServiceCard({
  service,
  isUpdating,
  canPublishListings,
  onToggleActive,
  onDelete,
}: {
  service: VendorService;
  isUpdating: boolean;
  canPublishListings: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const publishBlocked = !canPublishListings && !service.isActive;
  const publishDisabled = isUpdating || publishBlocked;

  return (
    <article
      className={cn(
        "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm sm:p-5",
        "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          {service.primaryImageUrl ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/60 bg-white/50 shadow-sm">
              <Image
                src={service.primaryImageUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <StatIcon icon={Package} theme="primary" className="!h-14 !w-14 !rounded-xl" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn("truncate font-medium", vg.body)}>{service.serviceName}</h3>
              <StatusBadge active={service.isActive} />
            </div>
            <p className={cn("mt-0.5 truncate", vg.subtitle)}>
              {service.tagline?.trim() || "No headline yet"}
            </p>
            <div className={cn("mt-2 flex flex-wrap items-center gap-2", vg.caption)}>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/55 px-2.5 py-1 text-xs font-medium ring-1 ring-white/60">
                <Tag size={12} aria-hidden />
                {service.categoryName}
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatLKR(service.basePrice)}
              </span>
              <span className="capitalize">{service.pricingType.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2.5">
            {isUpdating ? (
              <InlineSpinner />
            ) : (
              <ToggleSwitch
                checked={service.isActive}
                onChange={onToggleActive}
                disabled={publishDisabled}
                aria-label={
                  publishBlocked
                    ? `Publishing unavailable until verification for ${service.serviceName}`
                    : service.isActive
                      ? `Unpublish ${service.serviceName}`
                      : `Publish ${service.serviceName}`
                }
              />
            )}
            <span className={cn("text-xs font-medium", vg.caption)}>
              {service.isActive ? "Live" : "Hidden"}
            </span>
          </div>

          <div className="flex items-center gap-0.5 rounded-xl bg-white/45 p-0.5 ring-1 ring-white/55">
            <IconButton
              icon={Pencil}
              label="Edit listing"
              href={`/vendor/dashboard/services/${service.id}/edit`}
              glass
            />
            <RowActionsMenu
              glass
              actions={[
                {
                  key: "toggle",
                  label: service.isActive ? "Unpublish" : "Publish",
                  onClick: onToggleActive,
                  disabled: publishDisabled,
                },
                {
                  key: "delete",
                  label: "Delete listing",
                  onClick: onDelete,
                  destructive: true,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
