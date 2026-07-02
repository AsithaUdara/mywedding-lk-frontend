"use client";

import React, { useState } from "react";
import { Star, Phone } from "lucide-react";
import BookingModal from "./BookingModal";
import { pricingTypeLabel } from "@/shared/lib/vendorMedia";
import { phoneTelHref, formatDisplayPhone } from "@/shared/lib/phone";
import { useVendorDetailAuth } from "@/modules/vendors/context/VendorDetailAuthContext";
import { formatLKR } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface BookingPanelProps {
  price: number;
  pricingType?: string;
  rating: number;
  reviews: number;
  vendorName: string;
  vendorId: string;
  serviceId?: string;
  serviceName?: string;
  contactPhone?: string | null;
  variant?: "default" | "compact";
}

const BookingPanel = ({
  price,
  pricingType = "Fixed",
  rating,
  reviews,
  vendorName,
  vendorId,
  serviceId,
  serviceName,
  contactPhone,
  variant = "default",
}: BookingPanelProps) => {
  void vendorId;
  const { requireAuth } = useVendorDetailAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const openBooking = () => setModalOpen(true);
  const handleBookingClick = () => requireAuth("book", openBooking);

  const modals = (
    <>
      {serviceId && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          vendorName={vendorName}
          serviceId={serviceId}
          price={price}
        />
      )}
    </>
  );

  if (variant === "compact") {
    return (
      <>
        <GlassButton
          type="button"
          variant="primary"
          onClick={handleBookingClick}
          disabled={!serviceId}
        >
          {serviceId ? "Reserve" : "Unavailable"}
        </GlassButton>
        {modals}
      </>
    );
  }

  const telHref = contactPhone ? phoneTelHref(contactPhone) : null;

  return (
    <>
      <div className={cn(rf.panel, "p-5 sm:p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatLKR(price)}
              <span className="text-base font-normal text-muted-foreground">
                {pricingTypeLabel(pricingType)}
              </span>
            </p>
            {serviceName && (
              <p className="mt-1 text-sm font-medium text-foreground">{serviceName}</p>
            )}
          </div>
          {reviews > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-accent text-accent" aria-hidden />
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews})</span>
            </div>
          )}
        </div>

        <p className={cn("mt-5 border-t border-white/40 pt-5", rf.subtitle)}>
          Choose your event date and submit a booking request. The vendor will confirm availability.
        </p>

        <GlassButton
          type="button"
          variant="primary"
          onClick={handleBookingClick}
          disabled={!serviceId}
          className="mt-5 w-full justify-center"
        >
          {serviceId ? "Request to book" : "No services available"}
        </GlassButton>
        <p className={cn("mt-2 text-center", rf.caption)}>You won&apos;t be charged yet</p>

        <div className="mt-5 space-y-2 border-t border-white/40 pt-5">
          <p className={rf.label}>Contact</p>
          {telHref ? (
            <a href={telHref} className={cn(rf.btnGhost, "flex w-full items-center justify-center gap-2")}>
              <Phone size={16} aria-hidden />
              Call {formatDisplayPhone(contactPhone!)}
            </a>
          ) : (
            <p className={rf.caption}>Phone number not provided by vendor.</p>
          )}
          <p className={cn("text-center", rf.caption)}>
            Or send an inquiry from your planner dashboard.
          </p>
        </div>
      </div>
      {modals}
    </>
  );
};

export default BookingPanel;
