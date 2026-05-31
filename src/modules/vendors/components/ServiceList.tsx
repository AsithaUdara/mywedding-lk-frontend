"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock, ExternalLink, Users } from "lucide-react";
import BookingModal from "./BookingModal";
import { useVendorDetailAuth } from "@/modules/vendors/context/VendorDetailAuthContext";
import { pricingTypeLabel } from "@/shared/lib/vendorMedia";
import { parseListingDetails } from "@/shared/lib/serviceListingDetails";
import { formatLKR } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

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
  vendorId?: string;
  selectedServiceId?: string;
  onSelectService?: (serviceId: string) => void;
  bookingMode?: "panel" | "inline";
}

const serviceCardClass =
  "overflow-hidden rounded-2xl border border-white/55 bg-white/40 backdrop-blur-sm transition-all duration-200";

const ServiceList = ({
  services,
  vendorName,
  vendorId,
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
    return <p className={rf.subtitle}>No active services listed yet.</p>;
  }

  return (
    <div className="space-y-4">
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
            className={cn(
              serviceCardClass,
              isSelected
                ? "border-primary/40 bg-white/55 ring-2 ring-primary/15"
                : "hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_16px_hsl(345_100%_25%/0.06)]",
              onSelectService && "cursor-pointer"
            )}
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
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xl font-bold text-foreground">{service.serviceName}</h4>
                    {service.tagline && (
                      <p className="mt-1 text-sm font-medium text-primary">{service.tagline}</p>
                    )}
                    {(details.durationLabel || details.capacityNote) && (
                      <div className="mt-3 flex flex-wrap gap-2">
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
                    {details.highlights.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {details.highlights.map((highlight, index) => (
                          <span
                            key={`highlight-${index}-${highlight}`}
                            className="rounded-full border border-white/55 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary backdrop-blur-sm"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="text-2xl font-bold text-primary">
                      {formatLKR(service.basePrice)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {pricingTypeLabel(service.pricingType ?? "Fixed")}
                      </span>
                    </p>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      {vendorId && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/vendor/${vendorId}/services/${service.id}`}
                            className={cn(
                              rf.btnGhost,
                              "inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
                            )}
                          >
                            View details
                            <ExternalLink size={14} aria-hidden />
                          </Link>
                        </div>
                      )}
                      {onSelectService && bookingMode === "panel" && isSelected && (
                        <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
                          Selected for booking
                        </span>
                      )}
                      {onSelectService && bookingMode === "inline" && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <GlassButton
                            type="button"
                            variant={isSelected ? "primary" : "ghost"}
                            onClick={() => onSelectService(service.id)}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </GlassButton>
                        </div>
                      )}
                      {bookingMode === "inline" && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <GlassButton
                            type="button"
                            variant="primary"
                            className="w-full sm:w-auto"
                            onClick={() => handleBookClick(service)}
                          >
                            Book this service
                          </GlassButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {service.description && (
                  <p className={cn("mt-4 text-sm leading-relaxed", rf.subtitle)}>{service.description}</p>
                )}

                {details.includedItems.length > 0 && (
                  <div className="mt-4 border-t border-white/40 pt-4">
                    <p className={rf.label}>What&apos;s included</p>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {bookingService && (
        <BookingModal
          isOpen
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
