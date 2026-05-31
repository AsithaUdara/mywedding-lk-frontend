"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Award, MapPin, Globe, Star, ChevronLeft, PenLine } from "lucide-react";
import ImageGallery from "./ImageGallery";
import BookingPanel from "./BookingPanel";
import ServiceList from "./ServiceList";
import ReviewCard from "./ReviewCard";
import { VENDOR_IMAGE_PLACEHOLDER } from "@/shared/lib/vendorMedia";
import type { VendorDetail } from "@/shared/lib/api/vendors";
import { useVendorDetailAuth } from "@/modules/vendors/context/VendorDetailAuthContext";
import { formatLKR } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface VendorDetailContentProps {
  vendor: VendorDetail;
  mapUrl: string;
}

const sectionDivide = "border-b border-white/40 pb-10";

export default function VendorDetailContent({ vendor, mapUrl }: VendorDetailContentProps) {
  const { requireAuth } = useVendorDetailAuth();
  const services = vendor.services.map((service) => ({
    id: service.id,
    serviceName: service.serviceName,
    description: service.description,
    basePrice: service.basePrice,
    pricingType: service.pricingType,
    primaryImageUrl: service.primaryImageUrl,
    tagline: service.tagline,
    listingDetailsJson: service.listingDetailsJson,
    galleryUrls: service.galleryUrls,
  }));

  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(services[0]?.id);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [services, selectedServiceId]
  );

  const displayImages = useMemo(() => {
    const urls = [
      ...(vendor.galleryImageUrls ?? []),
      ...services.flatMap((service) => [
        ...(service.primaryImageUrl ? [service.primaryImageUrl] : []),
        ...(service.galleryUrls ?? []),
      ]),
    ].filter((url, index, arr) => url && arr.indexOf(url) === index);

    if (urls.length > 0) return urls;
    if (vendor.coverImageUrl) return [vendor.coverImageUrl];
    return [VENDOR_IMAGE_PLACEHOLDER];
  }, [vendor.coverImageUrl, vendor.galleryImageUrls, services]);

  const isVerified = vendor.verificationStatus === "Verified";
  const reviewCount = vendor.reviews.length;
  const locationLabel = [vendor.city, vendor.province, "Sri Lanka"].filter(Boolean).join(", ");

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="border-b border-white/40 py-4">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ChevronLeft size={16} aria-hidden />
            Back to vendors
          </Link>
        </nav>

        <header className="border-b border-white/40 py-6">
          <p className={rf.eyebrow}>Vendor profile</p>
          <h1 className={cn(rf.heroTitle, "mt-1 text-2xl sm:text-3xl lg:text-4xl")}>
            {vendor.businessName}
          </h1>
          <div className={cn("mt-3 flex flex-wrap items-center gap-x-3 gap-y-2", rf.subtitle)}>
            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Star size={15} className="fill-accent text-accent" aria-hidden />
                {vendor.averageRating.toFixed(1)}
                <span className="font-normal text-muted-foreground">({reviewCount} reviews)</span>
              </span>
            ) : (
              <span>New listing · No reviews yet</span>
            )}
            <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} className="text-primary" aria-hidden />
              {locationLabel}
            </span>
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
          </div>
          {vendor.websiteUrl && (
            <div className="mt-4">
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(rf.btnGhost, "inline-flex gap-1.5")}
              >
                <Globe size={14} aria-hidden />
                Visit website
              </a>
            </div>
          )}
        </header>

        <section className="py-6">
          <ImageGallery images={displayImages} vendorName={vendor.businessName} />
        </section>

        <div className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            {vendor.businessDescription && (
              <section className={sectionDivide}>
                <h2 className={rf.sectionTitle}>About this vendor</h2>
                <p className={cn("mt-4 whitespace-pre-line text-base leading-relaxed", rf.subtitle)}>
                  {vendor.businessDescription}
                </p>
              </section>
            )}

            <section className={sectionDivide}>
              <h2 className={rf.sectionTitle}>Services & packages</h2>
              <p className={cn("mt-1", rf.subtitle)}>
                Select a service to see pricing in the booking panel.
              </p>
              <div className="mt-6">
                <ServiceList
                  services={services}
                  vendorName={vendor.businessName}
                  vendorId={vendor.userId}
                  selectedServiceId={selectedServiceId}
                  onSelectService={setSelectedServiceId}
                  bookingMode="panel"
                />
              </div>
            </section>

            <section className={sectionDivide}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className={rf.sectionTitle}>
                  Reviews
                  {reviewCount > 0 && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      ({reviewCount})
                    </span>
                  )}
                </h2>
                <GlassButton
                  type="button"
                  variant="ghost"
                  className="gap-1.5"
                  onClick={() => requireAuth("review", () => undefined)}
                >
                  <PenLine size={14} aria-hidden />
                  Write a review
                </GlassButton>
              </div>
              {reviewCount > 0 ? (
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {vendor.reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={{
                        name: review.reviewerName,
                        date: new Date(review.createdAt).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        }),
                        rating: review.rating,
                        text: review.reviewContent,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className={cn("mt-4", rf.subtitle)}>No reviews yet. Be the first to book and share feedback.</p>
              )}
            </section>

            <section>
              <h2 className={rf.sectionTitle}>Location</h2>
              <p className={cn("mt-2", rf.subtitle)}>{locationLabel}</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/55 ring-1 ring-white/60">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${vendor.businessName} in ${vendor.city}`}
                />
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel
                price={selectedService?.basePrice ?? 0}
                pricingType={selectedService?.pricingType ?? "Fixed"}
                rating={vendor.averageRating}
                reviews={reviewCount}
                vendorName={vendor.businessName}
                vendorId={vendor.userId}
                serviceId={selectedService?.id}
                serviceName={selectedService?.serviceName}
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
              {formatLKR(selectedService?.basePrice ?? 0)}
              <span className="text-sm font-normal text-muted-foreground"> / event</span>
            </p>
            {selectedService && (
              <p className={cn("truncate", rf.caption)}>{selectedService.serviceName}</p>
            )}
          </div>
          <BookingPanel
            price={selectedService?.basePrice ?? 0}
            pricingType={selectedService?.pricingType ?? "Fixed"}
            rating={vendor.averageRating}
            reviews={reviewCount}
            vendorName={vendor.businessName}
            vendorId={vendor.userId}
            serviceId={selectedService?.id}
            serviceName={selectedService?.serviceName}
            variant="compact"
          />
        </div>
      </div>
      <div className="h-24 lg:hidden" aria-hidden />
    </div>
  );
}
