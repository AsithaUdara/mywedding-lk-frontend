"use client";

import React, { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface HorizontalScrollSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const HorizontalScrollSection = ({ title, subtitle, children }: HorizontalScrollSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount =
        direction === "left"
          ? -scrollContainerRef.current.offsetWidth * 0.9
          : scrollContainerRef.current.offsetWidth * 0.9;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="rounded-full border border-border bg-card p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md"
            aria-label="Scroll left"
          >
            <ArrowLeft size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="rounded-full border border-border bg-card p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md"
            aria-label="Scroll right"
          >
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex space-x-6 overflow-x-auto py-4 no-scrollbar">
        {children}
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
