"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    category: string;
    location: string;
    price: number;
    rating: number;
    totalReviews: number;
    isVerified?: boolean;
    images: string[];
  };
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
    <Link href={`/vendor/${vendor.id}`} className="group block">
      <div className="cursor-pointer">
        <div className="relative mb-2 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/55 bg-white/30 ring-1 ring-white/60 backdrop-blur-sm">
          <Image
            src={vendor.images[currentImage]}
            alt={vendor.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {vendor.images.length > 1 && (
            <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <button
                type="button"
                onClick={prevImage}
                className={cn(rf.glassSubtle, "rounded-full p-1.5 shadow-md backdrop-blur-sm")}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className={cn(rf.glassSubtle, "rounded-full p-1.5 shadow-md backdrop-blur-sm")}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="mt-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-foreground">{vendor.name}</h3>
              {vendor.isVerified && (
                <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success ring-1 ring-success/15">
                  Verified
                </span>
              )}
            </div>
            <p className={cn("text-sm", rf.subtitle)}>
              {vendor.category} · {vendor.location}
            </p>
            {vendor.totalReviews > 0 && (
              <p className={rf.caption}>
                {vendor.totalReviews} review{vendor.totalReviews === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 text-sm">
            <Star size={14} className="fill-accent text-accent" aria-hidden />
            <span className="font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-1 text-sm">
          {vendor.price > 0 ? (
            <>
              <span className="font-semibold text-foreground">
                LKR {vendor.price.toLocaleString()}
              </span>
              <span className={rf.subtitle}> starting</span>
            </>
          ) : (
            <span className={cn("font-medium", rf.subtitle)}>Packages coming soon</span>
          )}
        </p>
      </div>
    </Link>
  );
};

export default VendorCard;
