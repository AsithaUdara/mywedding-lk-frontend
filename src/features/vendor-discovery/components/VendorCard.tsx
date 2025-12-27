// src/features/vendor-discovery/components/VendorCard.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface VendorCardProps {
  vendor: {
    id: string | number;
    name: string;
    category: string;
    location: string;
    images: string[];
    rating: number;
    price: number;
  }
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % vendor.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + vendor.images.length) % vendor.images.length);
  };

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <div className="group cursor-pointer">
        <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl">
          <button className="absolute top-3 right-3 z-10 p-1 rounded-full bg-black/20 hover:bg-black/50 transition">
            <Heart size={24} className="text-white" fill="rgba(0,0,0,0.5)" strokeWidth={1}/>
          </button>
          
          {/* Modern Next.js Image Syntax */}
          <Image
            src={vendor.images[currentImage]}
            alt={vendor.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute top-1/2 -translate-y-12 w-full flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={prevImage} className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md">
                  <ChevronLeft size={18} />
              </button>
              <button onClick={nextImage} className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md">
                  <ChevronRight size={18} />
              </button>
          </div>
        </div>
        <div className="flex justify-between items-start mt-1">
          <h3 className="font-semibold text-md">{vendor.name}</h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star size={14} fill="black" strokeWidth={0}/>
            <span className="text-sm">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{vendor.category} in {vendor.location}</p>
        <p className="mt-1">
          <span className="font-semibold">LKR {vendor.price.toLocaleString()}</span> / event
        </p>
      </div>
    </Link>
  );
};

export default VendorCard;