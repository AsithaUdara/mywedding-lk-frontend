// src/components/ui/HorizontalScrollSection.tsx
"use client";

import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Define the props the component will receive.
interface HorizontalScrollSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode; // THE FIX: Reverted to the standard 'children' prop.
}

const HorizontalScrollSection = ({ title, subtitle, children }: HorizontalScrollSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // We scroll by 90% of the container's width for a smooth, multi-card scroll.
      const scrollAmount = direction === 'left' 
        ? -scrollContainerRef.current.offsetWidth * 0.9 
        : scrollContainerRef.current.offsetWidth * 0.9;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-4xl font-bold text-charcoal">{title}</h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => scroll('left')} className="p-3 border rounded-full hover:shadow-md transition-shadow">
            <ArrowLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} className="p-3 border rounded-full hover:shadow-md transition-shadow">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      {/* THE FIX: We now render the children directly, without calling it as a function. */}
      <div ref={scrollContainerRef} className="flex space-x-6 overflow-x-auto no-scrollbar py-4">
        {children}
      </div>
    </section>
  );
};

export default HorizontalScrollSection;