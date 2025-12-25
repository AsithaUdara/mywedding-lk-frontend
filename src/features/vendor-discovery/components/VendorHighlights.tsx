// src/features/vendor-discovery/components/VendorHighlights.tsx
import React from 'react';
import { Award, Star } from 'lucide-react';

interface VendorHighlightsProps {
  rating: number;
  tags: string[];
}

const VendorHighlights = ({ rating, tags }: VendorHighlightsProps) => {
  return (
    <div className="flex space-x-4 border-b pb-8">
      {tags.includes("5-star") && (
        <div className="flex items-center">
          <Award size={40} className="text-accent mr-3"/>
          <div>
            <p className="font-bold">Top-rated Vendor</p>
            <p className="text-sm text-gray-500">One of the most loved vendors on MyWedding.lk</p>
          </div>
        </div>
      )}
       <div className="flex items-center">
          <Star size={40} className="text-accent mr-3"/>
          <div>
            <p className="font-bold">{rating} Star Rating</p>
            <p className="text-sm text-gray-500">Highly ranked based on reviews and reliability.</p>
          </div>
        </div>
    </div>
  );
};

export default VendorHighlights;