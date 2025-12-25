// src/features/vendor-discovery/components/BookingPanel.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface BookingPanelProps {
  price: number;
  rating: number;
  reviews: number;
}

const BookingPanel = ({ price, rating, reviews }: BookingPanelProps) => {
  return (
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
        <div>
          <label className="block text-sm font-semibold">EVENT DATE</label>
          <input type="date" className="w-full mt-1 p-3 border rounded-lg"/>
        </div>
      </div>

      <button className="w-full mt-6 py-4 rounded-lg text-white font-semibold elegant-lift-button" style={{ backgroundColor: 'var(--color-primary)' }}>
        Request a Quote
      </button>
      <p className="text-center text-xs text-gray-400 mt-3">You won&apos;t be charged yet</p>
    </div>
  );
};

export default BookingPanel;