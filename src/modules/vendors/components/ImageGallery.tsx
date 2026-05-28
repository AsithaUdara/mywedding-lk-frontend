import React from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  vendorName: string;
}

const ImageGallery = ({ images, vendorName }: ImageGalleryProps) => {
  const unique = images.filter(Boolean);
  const primary = unique[0] ?? "";
  const secondary = [
    unique[1] ?? primary,
    unique[2] ?? unique[1] ?? primary,
    unique[3] ?? unique[0] ?? primary,
    unique[4] ?? unique[2] ?? primary,
  ];

  if (!primary) return null;

  return (
    <>
      {/* Mobile: single hero image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:hidden">
        <Image
          src={primary}
          alt={`${vendorName} — cover photo`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          unoptimized
        />
        {unique.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-charcoal shadow-sm">
            1 / {unique.length} photos
          </div>
        )}
      </div>

      {/* Tablet+: Airbnb-style mosaic */}
      <div className="hidden h-[min(55vh,480px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl sm:grid">
        <div className="relative col-span-2 row-span-2 cursor-pointer overflow-hidden">
          <Image
            src={primary}
            alt={`${vendorName} — main photo`}
            fill
            sizes="(max-width: 1024px) 50vw, 40vw"
            className="object-cover transition hover:brightness-95"
            priority
            unoptimized
          />
        </div>
        {secondary.slice(0, 3).map((src, i) => (
          <div key={i} className="relative cursor-pointer overflow-hidden">
            <Image
              src={src}
              alt={`${vendorName} — photo ${i + 2}`}
              fill
              sizes="20vw"
              className="object-cover transition hover:brightness-95"
              unoptimized
            />
          </div>
        ))}
        <div className="relative cursor-pointer overflow-hidden">
          <Image
            src={secondary[3]}
            alt={`${vendorName} — photo 5`}
            fill
            sizes="20vw"
            className="object-cover transition hover:brightness-95"
            unoptimized
          />
          {unique.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-sm font-semibold text-white transition hover:bg-black/35">
              Show all photos
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageGallery;
