// src/features/vendor-discovery/components/StyleCard.tsx
import React from 'react';
import Image from 'next/image';

interface StyleCardProps { title: string; subtitle: string; imageUrl: string; }

const StyleCard = ({ title, subtitle, imageUrl }: StyleCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative w-full h-80 overflow-hidden rounded-xl">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-xl font-bold text-charcoal mt-4">{title}</h3>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
};

export default StyleCard;