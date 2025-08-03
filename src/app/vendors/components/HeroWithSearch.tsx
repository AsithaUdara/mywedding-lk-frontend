// src/app/vendors/components/HeroWithSearch.tsx
import React from 'react';
import Image from 'next/image';
import SearchForm from '@/features/vendor-discovery/components/SearchForm';

// Define the props this component will receive
interface HeroWithSearchProps {
  imageUrl: string;
  searchType: 'vendor' | 'venue';
}

const HeroWithSearch = ({ imageUrl, searchType }: HeroWithSearchProps) => {
  return (
    <section className="relative" style={{ height: '550px' }}>
      <div className="absolute inset-0 z-0 flex">
        <div className="w-5/12" style={{ backgroundColor: 'var(--color-cream)' }}></div>
        <div className="w-7/12 relative rounded-bl-2xl overflow-hidden">
          {/* Use the imageUrl from props */}
          <Image 
            src={imageUrl}
            alt="Beautiful Wedding Venue in Sri Lanka" 
            layout="fill" 
            objectFit="cover" 
            priority
          />
        </div>
      </div>
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="container mx-auto px-4">
          <div className="ml-auto md:ml-32 lg:ml-48">
            {/* Pass the searchType down to the form */}
            <SearchForm type={searchType} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWithSearch;