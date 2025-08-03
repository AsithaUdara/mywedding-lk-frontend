// src/features/vendor-discovery/components/ReviewCard.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: {
    name: string;
    date: string;
    text: string;
    rating: number;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div>
      <div className="flex items-center space-x-4 mb-2">
        {/* A simple initial-based avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-charcoal">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-lg">{review.name}</p>
          <p className="text-sm text-gray-500">{review.date}</p>
        </div>
      </div>
      <div className="flex mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < review.rating ? 'text-accent' : 'text-gray-300'} fill="currentColor" />
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed">
        {review.text}
      </p>
    </div>
  );
};

export default ReviewCard;