// src/features/vendor-discovery/components/ImageGallery.tsx
import React from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  vendorName: string;
}

const ImageGallery = ({ images, vendorName }: ImageGalleryProps) => {
  const displayImages = [
    images[0] || '', images[1] || images[0] || '', 
    images[2] || images[1] || '', images[3] || images[0] || '',
    images[4] || images[2] || ''
  ];

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[550px] overflow-hidden rounded-2xl">
      <div className="col-span-2 row-span-2 relative cursor-pointer group">
        {/* THE FIX: Changed to modern syntax with `fill` and `sizes` props */}
        <Image 
          src={displayImages[0]} 
          alt={`${vendorName} main image`} 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }} 
          className="group-hover:opacity-90 transition-opacity" 
          priority 
        />
      </div>
      <div className="relative cursor-pointer group">
        <Image src={displayImages[1]} alt={`${vendorName} thumbnail 1`} fill sizes="25vw" style={{ objectFit: 'cover' }} className="group-hover:opacity-90 transition-opacity" />
      </div>
      <div className="relative cursor-pointer group">
        <Image src={displayImages[2]} alt={`${vendorName} thumbnail 2`} fill sizes="25vw" style={{ objectFit: 'cover' }} className="group-hover:opacity-90 transition-opacity" />
      </div>
      <div className="relative cursor-pointer group">
        <Image src={displayImages[3]} alt={`${vendorName} thumbnail 3`} fill sizes="25vw" style={{ objectFit: 'cover' }} className="group-hover:opacity-90 transition-opacity" />
      </div>
      <div className="relative cursor-pointer group">
        <Image src={displayImages[4]} alt={`${vendorName} thumbnail 4`} fill sizes="25vw" style={{ objectFit: 'cover' }} className="group-hover:opacity-90 transition-opacity" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold text-lg hover:bg-black/50 transition-colors">
          Show all photos
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;