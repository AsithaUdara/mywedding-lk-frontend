// src/app/vendors/components/HeroWithSearch.tsx
import React from 'react';
import Image from 'next/image';
import SearchForm from '@/features/vendor-discovery/components/SearchForm';

const HeroWithSearch = () => {
  return (
    <section className="relative" style={{ height: '550px' }}>
      
      {/* Layer 1: The Split Background */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-5/12" style={{ backgroundColor: 'var(--color-cream)' }}></div>
        <div className="w-7/12 relative rounded-b-2xl overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80" 
            alt="Beautiful Wedding Venue in Sri Lanka" 
            layout="fill" 
            objectFit="cover" 
            priority
          />
        </div>
      </div>

      {/* Layer 2: The Floating Search Form */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="container mx-auto px-4">
          {/* THE FIX IS HERE: Increased the left margin to push the card further onto the image */}
          <div className="ml-auto md:ml-32 lg:ml-48"> 
            <SearchForm />
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroWithSearch;