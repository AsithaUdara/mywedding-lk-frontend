"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
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
        <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <button
            type="button"
            className="absolute right-3 top-3 z-10 rounded-full bg-foreground/20 p-1 transition hover:bg-foreground/40"
            aria-label="Save to favorites"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={22} className="text-primary-foreground" strokeWidth={1.5} />
          </button>

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
                className="rounded-full bg-card/90 p-1.5 shadow-md hover:bg-card"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="rounded-full bg-card/90 p-1.5 shadow-md hover:bg-card"
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
                <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {vendor.category} · {vendor.location}
            </p>
            {vendor.totalReviews > 0 && (
              <p className="text-xs text-muted-foreground">
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
          <span className="font-semibold text-foreground">
            LKR {vendor.price.toLocaleString()}
          </span>
          <span className="text-muted-foreground"> starting</span>
        </p>
      </div>
    </Link>
  );
};

export default VendorCard;
