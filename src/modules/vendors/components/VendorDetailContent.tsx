"use client";

import React, { useMemo, useState } from "react";
import ImageGallery from "./ImageGallery";
import BookingPanel from "./BookingPanel";
import ServiceList from "./ServiceList";
import { VENDOR_IMAGE_PLACEHOLDER } from "@/shared/lib/vendorMedia";
import type { VendorDetail } from "@/shared/lib/api/vendors";

interface VendorDetailContentProps {
  vendor: VendorDetail;
}

export default function VendorDetailContent({ vendor }: VendorDetailContentProps) {
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

  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(
    services[0]?.id
  );

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

    if (urls.length > 0) {
      return urls;
    }

    if (vendor.coverImageUrl) {
      return [vendor.coverImageUrl];
    }

    return [VENDOR_IMAGE_PLACEHOLDER];
  }, [vendor.coverImageUrl, vendor.galleryImageUrls, services]);

  return (
    <>
      <ImageGallery images={displayImages} vendorName={vendor.businessName} />

      <div className="relative mt-32 flex flex-col gap-16 pb-12 md:flex-row">
        <div className="w-full md:w-3/5">
          <div className="border-b py-8">
            <h3 className="mb-6 text-2xl font-bold">Services Offered</h3>
            <ServiceList
              services={services}
              vendorName={vendor.businessName}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
            />
          </div>
        </div>

        <div className="w-full md:w-2/5">
          <div className="sticky top-40 z-30">
            <BookingPanel
              price={selectedService?.basePrice ?? 0}
              pricingType={selectedService?.pricingType ?? "Fixed"}
              rating={vendor.averageRating}
              reviews={vendor.reviews.length}
              vendorName={vendor.businessName}
              vendorId={vendor.userId}
              serviceId={selectedService?.id}
              serviceName={selectedService?.serviceName}
            />
          </div>
        </div>
      </div>
    </>
  );
}
