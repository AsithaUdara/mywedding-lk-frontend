"use client";

import Image from "next/image";
import { Check, Clock, Users, Star } from "lucide-react";
import { formatLKR } from "@/modules/vendor/dashboard/ui";
import { pricingTypeLabel, VENDOR_IMAGE_PLACEHOLDER } from "@/shared/lib/vendorMedia";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import type { ServiceListingFormState } from "./types";

interface ListingPreviewPanelProps {
  form: ServiceListingFormState;
  primaryPreview: string | null;
}

export default function ListingPreviewPanel({ form, primaryPreview }: ListingPreviewPanelProps) {
  const hero = primaryPreview || form.primaryImageUrl || VENDOR_IMAGE_PLACEHOLDER;
  const sideImages = [
    ...form.galleryUrls.slice(0, 2),
    ...form.pendingGalleryItems.map((item) => item.previewUrl),
  ].filter(Boolean);

  const displaySides = [
    sideImages[0] || hero,
    sideImages[1] || sideImages[0] || hero,
    sideImages[2] || hero,
    sideImages[0] || hero,
  ];

  return (
    <div className="space-y-3 lg:sticky lg:top-28">
      <div className={cn(vd.metaBox, "px-4 py-3")}>
        <p className={vg.label}>Live preview</p>
        <p className={cn("mt-0.5", vg.caption)}>How couples see your listing</p>
      </div>
      <div className="listing-editor-preview-card overflow-hidden rounded-2xl">
        <div className="grid h-48 grid-cols-4 grid-rows-2 gap-1 bg-white/30 p-1">
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-lg ring-1 ring-white/50">
            <Image src={hero} alt="" fill className="object-cover" unoptimized />
          </div>
          {displaySides.slice(0, 3).map((src, index) => (
            <div key={index} className="relative overflow-hidden rounded-md ring-1 ring-white/40">
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </div>
          ))}
          <div className="relative overflow-hidden rounded-md ring-1 ring-white/40">
            <Image src={displaySides[3]} alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 flex items-center justify-center bg-primary/55 text-xs font-semibold text-white backdrop-blur-[2px]">
              Gallery
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-white/45 p-5 backdrop-blur-sm">
          <div>
            <p className={vg.label}>{form.categoryName || "Category"}</p>
            <h3 className="font-luxury-section mt-1 text-xl font-medium text-foreground">
              {form.name || "Your service name"}
            </h3>
            {form.tagline && (
              <p className={cn("mt-1 font-medium text-primary", vg.body)}>{form.tagline}</p>
            )}
          </div>

          <div className={cn("flex items-center gap-2", vg.subtitle)}>
            <Star size={14} className="text-[hsl(42_48%_52%)]" fill="currentColor" />
            <span>New listing</span>
          </div>

          {(form.listingDetails.durationLabel || form.listingDetails.capacityNote) && (
            <div className="flex flex-wrap gap-2">
              {form.listingDetails.durationLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-white/60">
                  <Clock size={14} className="text-muted-foreground" />
                  {form.listingDetails.durationLabel}
                </span>
              )}
              {form.listingDetails.capacityNote && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-white/60">
                  <Users size={14} className="text-muted-foreground" />
                  {form.listingDetails.capacityNote}
                </span>
              )}
            </div>
          )}

          {form.listingDetails.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.listingDetails.highlights.slice(0, 4).map((item, index) => (
                <span
                  key={`highlight-${index}-${item}`}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-white/50 pt-4">
            <p className="font-semibold tabular-nums tracking-tight text-foreground">
              {form.basePrice ? formatLKR(parseFloat(form.basePrice)) : "LKR —"}
              <span className={cn("font-normal", vg.caption)}>
                {pricingTypeLabel(form.pricingType)}
              </span>
            </p>
          </div>

          {form.description && (
            <p className={cn("line-clamp-4 leading-relaxed", vg.subtitle)}>{form.description}</p>
          )}

          {form.listingDetails.includedItems.length > 0 && (
            <div>
              <p className={cn("mb-2", vg.label)}>What&apos;s included</p>
              <ul className="space-y-1.5">
                {form.listingDetails.includedItems.slice(0, 5).map((item, index) => (
                  <li
                    key={`included-${index}-${item}`}
                    className={cn("flex items-start gap-2", vg.subtitle)}
                  >
                    <Check size={14} className="mt-0.5 flex-shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={cn(
              "rounded-xl px-4 py-3 text-center text-sm font-semibold",
              form.isActive
                ? "bg-success/10 text-success ring-1 ring-success/20"
                : "bg-white/50 text-muted-foreground ring-1 ring-white/60"
            )}
          >
            {form.isActive ? "Visible to couples" : "Draft — not published"}
          </div>
        </div>
      </div>
    </div>
  );
}
