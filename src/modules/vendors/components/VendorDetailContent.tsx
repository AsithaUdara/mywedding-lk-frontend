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

interface VendorDetailContentProps {
  vendor: VendorDetail;
  mapUrl: string;
}

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
    <div className="bg-white font-roboto text-charcoal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="border-b border-slate-100 py-4">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-primary"
          >
            <ChevronLeft size={16} />
            Back to vendors
          </Link>
        </nav>

        {/* Title block — Airbnb-style header */}
        <header className="border-b border-slate-100 py-6">
          <h1 className="font-playfair text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {vendor.businessName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-charcoal">
                <Star size={15} className="fill-amber-400 text-amber-400" />
                {vendor.averageRating.toFixed(1)}
                <span className="font-normal text-slate-500">({reviewCount} reviews)</span>
              </span>
            ) : (
              <span className="text-slate-500">New listing · No reviews yet</span>
            )}
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} className="text-slate-400" />
              {locationLabel}
            </span>
            {isVerified && (
              <>
                <span className="hidden text-slate-300 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <Award size={15} />
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-charcoal transition hover:border-primary/30 hover:text-primary"
              >
                <Globe size={14} />
                Visit website
              </a>
            </div>
          )}
        </header>

        {/* Photo gallery */}
        <section className="py-6">
          <ImageGallery images={displayImages} vendorName={vendor.businessName} />
        </section>

        {/* Main two-column layout */}
        <div className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            {/* About */}
            {vendor.businessDescription && (
              <section className="border-b border-slate-100 pb-10">
                <h2 className="text-xl font-semibold text-charcoal">About this vendor</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {vendor.businessDescription}
                </p>
              </section>
            )}

            {/* Services */}
            <section className="border-b border-slate-100 pb-10">
              <h2 className="text-xl font-semibold text-charcoal">Services & packages</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a service to see pricing in the booking panel.
              </p>
              <div className="mt-6">
                <ServiceList
                  services={services}
                  vendorName={vendor.businessName}
                  selectedServiceId={selectedServiceId}
                  onSelectService={setSelectedServiceId}
                  bookingMode="panel"
                />
              </div>
            </section>

            {/* Reviews */}
            <section className="border-b border-slate-100 pb-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-charcoal">
                  Reviews
                  {reviewCount > 0 && (
                    <span className="ml-2 text-base font-normal text-slate-500">({reviewCount})</span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => requireAuth("review", () => undefined)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-charcoal transition hover:border-primary/30 hover:text-primary"
                >
                  <PenLine size={14} />
                  Write a review
                </button>
              </div>
              {reviewCount > 0 ? (
                <div className="mt-6 grid gap-8 sm:grid-cols-2">
                  {vendor.reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={{
                        name: review.reviewerName,
                        date: new Date(review.createdAt).toLocaleDateString("en-US", {
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
                <p className="mt-4 text-sm text-slate-500">No reviews yet. Be the first to book and share feedback.</p>
              )}
            </section>

            {/* Location */}
            <section>
              <h2 className="text-xl font-semibold text-charcoal">Location</h2>
              <p className="mt-2 text-sm text-slate-600">{locationLabel}</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
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

          {/* Sticky booking panel — desktop */}
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

      {/* Mobile booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-charcoal">
              LKR {(selectedService?.basePrice ?? 0).toLocaleString()}
              <span className="text-sm font-normal text-slate-500"> / event</span>
            </p>
            {selectedService && (
              <p className="truncate text-xs text-slate-500">{selectedService.serviceName}</p>
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
