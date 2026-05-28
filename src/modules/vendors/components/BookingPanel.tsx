"use client";

import React, { useState } from "react";
import { Star, Phone } from "lucide-react";
import BookingModal from "./BookingModal";
import { pricingTypeLabel } from "@/shared/lib/vendorMedia";
import { phoneTelHref, formatDisplayPhone } from "@/shared/lib/phone";
import { useVendorDetailAuth } from "@/modules/vendors/context/VendorDetailAuthContext";

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
  const { requireAuth } = useVendorDetailAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const openBooking = () => setModalOpen(true);

  const handleBookingClick = () => {
    requireAuth("book", openBooking);
  };

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
        <button
          type="button"
          onClick={handleBookingClick}
          disabled={!serviceId}
          className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {serviceId ? "Reserve" : "Unavailable"}
        </button>
        {modals}
      </>
    );
  }

  const telHref = contactPhone ? phoneTelHref(contactPhone) : null;

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-charcoal">
              LKR {price.toLocaleString()}
              <span className="text-base font-normal text-slate-500">
                {pricingTypeLabel(pricingType)}
              </span>
            </p>
            {serviceName && (
              <p className="mt-1 text-sm font-medium text-charcoal">{serviceName}</p>
            )}
          </div>
          {reviews > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-charcoal text-charcoal" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-slate-500">({reviews})</span>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-sm text-slate-600">
            Choose your event date and submit a booking request. The vendor will confirm availability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBookingClick}
          disabled={!serviceId}
          className="mt-5 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {serviceId ? "Request to book" : "No services available"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">You won&apos;t be charged yet</p>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
          {telHref ? (
            <a
              href={telHref}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-slate-50"
            >
              <Phone size={16} />
              Call {formatDisplayPhone(contactPhone!)}
            </a>
          ) : (
            <p className="text-xs text-slate-500">Phone number not provided by vendor.</p>
          )}
          <p className="text-center text-[11px] text-slate-400">
            Calls go directly to the vendor.
          </p>
        </div>
      </div>
      {modals}
    </>
  );
};

export default BookingPanel;
