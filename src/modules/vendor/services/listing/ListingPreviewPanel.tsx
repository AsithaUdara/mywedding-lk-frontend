"use client";

import Image from "next/image";
import { Check, Clock, Users, Star } from "lucide-react";
import { formatLKR } from "@/modules/vendor/dashboard/ui";
import { pricingTypeLabel, VENDOR_IMAGE_PLACEHOLDER } from "@/shared/lib/vendorMedia";
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
      <div className="rounded-xl border border-primary/15 bg-cream/80 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Live preview</p>
        <p className="mt-0.5 text-xs text-charcoal/60">How couples see your listing</p>
      </div>
      <div className="listing-editor-preview-card overflow-hidden">
        <div className="grid h-48 grid-cols-4 grid-rows-2 gap-1 bg-accent-light/20 p-1">
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-lg">
            <Image src={hero} alt="" fill className="object-cover" unoptimized />
          </div>
          {displaySides.slice(0, 3).map((src, index) => (
            <div key={index} className="relative overflow-hidden rounded-md">
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </div>
          ))}
          <div className="relative overflow-hidden rounded-md">
            <Image src={displaySides[3]} alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 flex items-center justify-center bg-primary/50 text-xs font-bold text-white">
              Gallery
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-gradient-to-b from-white to-cream/30 p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
              {form.categoryName || "Category"}
            </p>
            <h3 className="font-playfair text-xl font-bold text-charcoal">
              {form.name || "Your service name"}
            </h3>
            {form.tagline && <p className="mt-1 text-sm font-medium text-primary/90">{form.tagline}</p>}
          </div>

          <div className="flex items-center gap-2 text-sm text-charcoal/60">
            <Star size={14} className="text-accent" fill="currentColor" />
            <span>New listing</span>
          </div>

          {(form.listingDetails.durationLabel || form.listingDetails.capacityNote) && (
            <div className="flex flex-wrap gap-2 text-sm">
              {form.listingDetails.durationLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light/60 px-3 py-1 text-charcoal/80">
                  <Clock size={14} className="text-primary" />
                  {form.listingDetails.durationLabel}
                </span>
              )}
              {form.listingDetails.capacityNote && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light/60 px-3 py-1 text-charcoal/80">
                  <Users size={14} className="text-primary" />
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
                  className="rounded-full border border-primary/15 bg-cream px-2.5 py-0.5 text-xs font-medium text-charcoal/80"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-primary/10 pt-4">
            <p className="text-lg font-bold text-charcoal">
              {form.basePrice ? formatLKR(parseFloat(form.basePrice)) : "LKR —"}
              <span className="text-sm font-normal text-charcoal/55">
                {pricingTypeLabel(form.pricingType)}
              </span>
            </p>
          </div>

          {form.description && (
            <p className="line-clamp-4 text-sm leading-relaxed text-charcoal/70">{form.description}</p>
          )}

          {form.listingDetails.includedItems.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary/70">
                What&apos;s included
              </p>
              <ul className="space-y-1.5">
                {form.listingDetails.includedItems.slice(0, 5).map((item, index) => (
                  <li key={`included-${index}-${item}`} className="flex items-start gap-2 text-sm text-charcoal/75">
                    <Check size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${
              form.isActive
                ? "bg-primary/10 text-primary"
                : "bg-charcoal/5 text-charcoal/50"
            }`}
          >
            {form.isActive ? "Visible to couples" : "Draft — not published"}
          </div>
        </div>
      </div>
    </div>
  );
}
