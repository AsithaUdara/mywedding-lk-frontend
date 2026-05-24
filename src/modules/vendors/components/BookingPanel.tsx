"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import BookingModal from "./BookingModal";
import InquiryModal from "./InquiryModal";
import { pricingTypeLabel } from "@/shared/lib/vendorMedia";

interface BookingPanelProps {
  price: number;
  pricingType?: string;
  rating: number;
  reviews: number;
  vendorName: string;
  vendorId: string;
  serviceId?: string;
  serviceName?: string;
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
}: BookingPanelProps) => {
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInquiryModalOpen, setInquiryModalOpen] = useState(false);

  const handleBookingClick = () => {
    if (!user) {
      alert("Please log in to book a vendor.");
      return;
    }
    if (serviceId) {
      setModalOpen(true);
    }
  };

  const handleContactClick = () => {
    if (!user) {
      alert("Please log in to contact this vendor.");
      return;
    }
    setInquiryModalOpen(true);
  };

  return (
    <>
      <div className="sticky top-28 rounded-xl border bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">LKR {price.toLocaleString()}</span>
            <span className="text-gray-500">{pricingTypeLabel(pricingType)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star size={16} fill="black" strokeWidth={0} />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-gray-500">({reviews})</span>
          </div>
        </div>

        {serviceName && (
          <p className="mb-2 text-sm font-semibold text-charcoal">{serviceName}</p>
        )}

        <div className="space-y-4 border-t pt-4">
          <p className="text-sm text-gray-600">
            Select your event and service date to request a booking.
          </p>
        </div>

        <button
          onClick={handleBookingClick}
          disabled={!serviceId}
          className="elegant-lift-button mt-6 w-full rounded-lg py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {serviceId ? "Request to Book" : "No Services Available"}
        </button>
        <p className="mt-3 text-center text-xs text-gray-400">You won&apos;t be charged yet</p>

        <div className="mt-4 border-t pt-4 text-center">
          <button
            onClick={handleContactClick}
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Contact Vendor
          </button>
        </div>
      </div>

      {serviceId && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          vendorName={vendorName}
          serviceId={serviceId}
          price={price}
        />
      )}

      {isInquiryModalOpen && (
        <InquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          vendorId={vendorId}
          vendorName={vendorName}
        />
      )}
    </>
  );
};

export default BookingPanel;
