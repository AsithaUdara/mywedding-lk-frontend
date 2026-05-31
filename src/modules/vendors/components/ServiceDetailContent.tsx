"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Check, ChevronLeft, Clock, MapPin, Star, Users } from "lucide-react";
import BookingPanel from "./BookingPanel";
import { VENDOR_IMAGE_PLACEHOLDER } from "@/shared/lib/vendorMedia";
import { parseListingDetails } from "@/shared/lib/serviceListingDetails";
import { pricingTypeLabel } from "@/shared/lib/vendorMedia";
import type { VendorDetail } from "@/shared/lib/api/vendors";
import { formatLKR } from "@/shared/components/ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

type ServiceDetailContentProps = {
  vendor: VendorDetail;
  serviceId: string;
};

export default function ServiceDetailContent({ vendor, serviceId }: ServiceDetailContentProps) {
  const service = vendor.services.find((item) => item.id === serviceId);

  const details = useMemo(
    () => parseListingDetails(service?.listingDetailsJson),
    [service?.listingDetailsJson]
  );

  const displayImages = useMemo(() => {
    const urls = [
      ...(service?.primaryImageUrl ? [service.primaryImageUrl] : []),
      ...(service?.galleryUrls ?? []),
      ...(vendor.galleryImageUrls ?? []),
      ...(vendor.coverImageUrl ? [vendor.coverImageUrl] : []),
    ].filter((url, index, arr) => url && arr.indexOf(url) === index);

    return urls.length > 0 ? urls : [VENDOR_IMAGE_PLACEHOLDER];
  }, [service, vendor.coverImageUrl, vendor.galleryImageUrls]);

  if (!service) {
    return null;
  }

  const reviewCount = vendor.reviews.length;
  const locationLabel = [vendor.city, vendor.province, "Sri Lanka"].filter(Boolean).join(", ");
  const isVerified = vendor.verificationStatus === "Verified";
  const vendorProfileHref = `/vendor/${vendor.userId}`;

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="border-b border-white/40 py-4">
          <Link
            href={vendorProfileHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ChevronLeft size={16} aria-hidden />
            Back to {vendor.businessName}
          </Link>
        </nav>

        <header className="border-b border-white/40 py-6">
          <p className={rf.eyebrow}>Service package</p>
          <h1 className={cn(rf.heroTitle, "mt-1 text-2xl sm:text-3xl lg:text-4xl")}>
            {service.serviceName}
          </h1>
          {service.tagline && (
            <p className="mt-2 text-base font-medium text-primary">{service.tagline}</p>
          )}
          <div className={cn("mt-3 flex flex-wrap items-center gap-x-3 gap-y-2", rf.subtitle)}>
            <Link href={vendorProfileHref} className="font-semibold text-foreground hover:text-primary">
              {vendor.businessName}
            </Link>
            {isVerified && (
              <>
                <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-success">
                  <Award size={15} aria-hidden />
                  Verified vendor
                </span>
              </>
            )}
            <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} className="text-primary" aria-hidden />
              {locationLabel}
            </span>
            {reviewCount > 0 && (
              <>
                <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star size={15} className="fill-accent text-accent" aria-hidden />
                  {vendor.averageRating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">({reviewCount} reviews)</span>
                </span>
              </>
            )}
          </div>
        </header>

        <div className="grid gap-12 py-8 pb-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            <section>
              <div className="grid gap-3 sm:grid-cols-2">
                {displayImages.slice(0, 4).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border border-white/55 bg-white/30",
                      index === 0 && displayImages.length > 1 ? "sm:col-span-2 sm:aspect-[16/7]" : "aspect-[4/3]"
                    )}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${service.serviceName} photo ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="border-b border-white/40 pb-10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-3xl font-bold text-primary">
                  {formatLKR(service.basePrice)}
                  <span className="text-base font-normal text-muted-foreground">
                    {pricingTypeLabel(service.pricingType)}
                  </span>
                </p>
                {(details.durationLabel || details.capacityNote) && (
                  <div className="flex flex-wrap gap-2">
                    {details.durationLabel && (
                      <span
                        className={cn(
                          rf.glassSubtle,
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-muted-foreground"
                        )}
                      >
                        <Clock size={14} aria-hidden />
                        {details.durationLabel}
                      </span>
                    )}
                    {details.capacityNote && (
                      <span
                        className={cn(
                          rf.glassSubtle,
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-muted-foreground"
                        )}
                      >
                        <Users size={14} aria-hidden />
                        {details.capacityNote}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {service.description && (
                <p className={cn("mt-4 whitespace-pre-line text-base leading-relaxed", rf.subtitle)}>
                  {service.description}
                </p>
              )}
            </section>

            {details.highlights.length > 0 && (
              <section className="border-b border-white/40 pb-10">
                <h2 className={rf.sectionTitle}>Highlights</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.highlights.map((highlight, index) => (
                    <span
                      key={`highlight-${index}-${highlight}`}
                      className="rounded-full border border-white/55 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {details.includedItems.length > 0 && (
              <section className="border-b border-white/40 pb-10">
                <h2 className={rf.sectionTitle}>What&apos;s included</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {details.includedItems.map((item, index) => (
                    <li
                      key={`included-${index}-${item}`}
                      className={cn("flex items-start gap-2 text-sm", rf.subtitle)}
                    >
                      <Check size={14} className="mt-0.5 flex-shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {vendor.services.length > 1 && (
              <section>
                <h2 className={rf.sectionTitle}>More from this vendor</h2>
                <ul className="mt-4 space-y-3">
                  {vendor.services
                    .filter((item) => item.id !== service.id)
                    .map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/vendor/${vendor.userId}/services/${item.id}`}
                          className="flex items-center justify-between rounded-xl border border-white/55 bg-white/40 px-4 py-3 backdrop-blur-sm transition hover:border-primary/30 hover:bg-white/55"
                        >
                          <span className="font-medium text-foreground">{item.serviceName}</span>
                          <span className="text-sm font-semibold text-primary">
                            {formatLKR(item.basePrice)}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel
                price={service.basePrice}
                pricingType={service.pricingType}
                rating={vendor.averageRating}
                reviews={reviewCount}
                vendorName={vendor.businessName}
                vendorId={vendor.userId}
                serviceId={service.id}
                serviceName={service.serviceName}
                contactPhone={vendor.contactPhone}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/55 bg-white/40 p-4 shadow-[0_-4px_20px_hsl(345_100%_25%/0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-bold text-primary">
              {formatLKR(service.basePrice)}
              <span className="text-sm font-normal text-muted-foreground">
                {pricingTypeLabel(service.pricingType)}
              </span>
            </p>
            <p className={cn("truncate", rf.caption)}>{service.serviceName}</p>
          </div>
          <BookingPanel
            price={service.basePrice}
            pricingType={service.pricingType}
            rating={vendor.averageRating}
            reviews={reviewCount}
            vendorName={vendor.businessName}
            vendorId={vendor.userId}
            serviceId={service.id}
            serviceName={service.serviceName}
            variant="compact"
          />
        </div>
      </div>
      <div className="h-24 lg:hidden" aria-hidden />
    </div>
  );
}
