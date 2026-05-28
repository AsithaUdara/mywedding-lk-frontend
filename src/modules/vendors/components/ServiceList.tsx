"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Clock, Users } from "lucide-react";
import BookingModal from "./BookingModal";
import { useVendorDetailAuth } from "@/modules/vendors/context/VendorDetailAuthContext";
import { pricingTypeLabel } from "@/shared/lib/vendorMedia";
import { parseListingDetails } from "@/shared/lib/serviceListingDetails";

interface Service {
  id: string;
  serviceName: string;
  description: string;
  basePrice: number;
  pricingType?: string;
  primaryImageUrl?: string | null;
  tagline?: string | null;
  listingDetailsJson?: string | null;
}

interface ServiceListProps {
  services: Service[];
  vendorName: string;
  selectedServiceId?: string;
  onSelectService?: (serviceId: string) => void;
  /** When "panel", booking happens via sticky sidebar — hide per-card book buttons */
  bookingMode?: "panel" | "inline";
}

const ServiceList = ({
  services,
  vendorName,
  selectedServiceId,
  onSelectService,
  bookingMode = "inline",
}: ServiceListProps) => {
  const { requireAuth } = useVendorDetailAuth();
  const [bookingService, setBookingService] = useState<Service | null>(null);

  const handleBookClick = (service: Service) => {
    requireAuth("book", () => setBookingService(service));
  };

  if (services.length === 0) {
    return <p className="text-gray-500">No active services listed yet.</p>;
  }

  return (
    <div className="space-y-6">
      {services.map((service) => {
        const details = parseListingDetails(service.listingDetailsJson);
        const isSelected = selectedServiceId === service.id;

        return (
          <div
            key={service.id}
            role={onSelectService ? "button" : undefined}
            tabIndex={onSelectService ? 0 : undefined}
            onClick={onSelectService ? () => onSelectService(service.id) : undefined}
            onKeyDown={
              onSelectService
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectService(service.id);
                    }
                  }
                : undefined
            }
            className={`overflow-hidden rounded-xl border transition-all ${
              isSelected
                ? "border-primary ring-2 ring-primary/15"
                : "border-slate-200 hover:border-slate-300"
            } ${onSelectService ? "cursor-pointer" : ""}`}
          >
            <div className="flex flex-col md:flex-row">
              {service.primaryImageUrl && (
                <div className="relative h-48 w-full flex-shrink-0 md:h-auto md:w-56">
                  <Image
                    src={service.primaryImageUrl}
                    alt={service.serviceName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-charcoal">{service.serviceName}</h4>
                    {service.tagline && (
                      <p className="mt-1 text-sm font-medium text-primary/90">{service.tagline}</p>
                    )}
                    {(details.durationLabel || details.capacityNote) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        {details.durationLabel && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                            <Clock size={14} />
                            {details.durationLabel}
                          </span>
                        )}
                        {details.capacityNote && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                            <Users size={14} />
                            {details.capacityNote}
                          </span>
                        )}
                      </div>
                    )}
                    {details.highlights.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {details.highlights.map((highlight, index) => (
                          <span
                            key={`highlight-${index}-${highlight}`}
                            className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="text-2xl font-bold text-charcoal">
                      LKR {service.basePrice.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500">
                        {pricingTypeLabel(service.pricingType ?? "Fixed")}
                      </span>
                    </p>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      {onSelectService && bookingMode === "panel" && isSelected && (
                        <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                          Selected for booking
                        </span>
                      )}
                      {onSelectService && bookingMode === "inline" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectService(service.id);
                          }}
                          className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-slate-200 text-charcoal hover:border-primary"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      )}
                      {bookingMode === "inline" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookClick(service);
                          }}
                          className="w-full whitespace-nowrap rounded-lg bg-charcoal px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-primary sm:w-auto"
                        >
                          Book this service
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {service.description && (
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{service.description}</p>
                )}

                {details.includedItems.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      What&apos;s included
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {details.includedItems.map((item, index) => (
                        <li key={`included-${index}-${item}`} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {bookingService && (
        <BookingModal
          isOpen={true}
          onClose={() => setBookingService(null)}
          vendorName={vendorName}
          serviceId={bookingService.id}
          price={bookingService.basePrice}
        />
      )}
    </div>
  );
};

export default ServiceList;
