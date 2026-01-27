"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BookingModal from './BookingModal';

interface BookingPanelProps {
  price: number;
  rating: number;
  reviews: number;
  vendorName: string;
  serviceId?: string;
}

const BookingPanel = ({ price, rating, reviews, vendorName, serviceId }: BookingPanelProps) => {
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleBookingClick = () => {
    if (!user) {
      alert("Please log in to book a vendor.");
      return;
    }
    if (serviceId) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="sticky top-28 p-6 rounded-xl shadow-2xl border bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold">LKR {price.toLocaleString()}</span>
            <span className="text-gray-500"> / event</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star size={16} fill="black" strokeWidth={0}/>
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-gray-500">({reviews})</span>
          </div>
        </div>
        
        <div className="space-y-4 border-t pt-4">
          <p className="text-sm text-gray-600">Select your event and service date to request a booking.</p>
        </div>

        <button 
          onClick={handleBookingClick}
          disabled={!serviceId}
          className="w-full mt-6 py-4 rounded-lg text-white font-semibold elegant-lift-button disabled:opacity-50 disabled:cursor-not-allowed" 
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {serviceId ? "Request to Book" : "No Services Available"}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">You won&apos;t be charged yet</p>
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
    </>
  );
};

export default BookingPanel;