// src/app/venues/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Layout & UI Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HorizontalScrollSection from '@/components/ui/HorizontalScrollSection';
import AuthModal from '@/features/authentication/AuthModal';

// Feature-Specific Components
import VendorCard from '@/features/vendor-discovery/components/VendorCard';
import StyleCard from '@/features/vendor-discovery/components/StyleCard';

// Page-Specific Components
// THE FIX IS HERE: Corrected the import path to point to the correct location in the vendors directory.
import HeroWithSearch from '@/app/vendors/components/HeroWithSearch'; 

// Data & Icons
import allVendorsData from '@/lib/data/vendors.json';

const VenuesHubPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  const allVenues = allVendorsData.filter(v => v.category === 'Venues');
  const topRatedVenues = allVenues.filter(v => v.rating >= 4.9);

  const styleCategories = [
    { title: 'Beachfront Venues', subtitle: 'Say "I do" with an ocean view', imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80' },
    { title: 'Luxury Hotels', subtitle: 'Grand ballrooms and elegant estates', imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80' },
    { title: 'Mountain Escapes', subtitle: 'Serene ceremonies with stunning views', imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <>
      <main className="bg-white">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        <HeroWithSearch 
          imageUrl="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1600&q=80"
          searchType="venue"
        />

        <div className="container mx-auto px-4 py-16 space-y-20">
          
          <HorizontalScrollSection title="Top-rated Venues in Sri Lanka" subtitle="Couples agree: these venues are highly rated for their beauty and service.">
            {topRatedVenues.map(vendor => (
              <div key={vendor.id} className="flex-shrink-0" style={{ width: 'calc(25% - 18px)' }}>
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </HorizontalScrollSection>

          <section>
            <h2 className="text-4xl font-bold text-charcoal mb-8">Venues for every style</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {styleCategories.map(style => <StyleCard key={style.title} {...style} />)}
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-bold text-charcoal mb-8">All Venues in Sri Lanka</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {allVenues.slice(0, 8).map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/vendors/search?category=Venues">
                <button className="px-8 py-4 border-2 border-charcoal rounded-lg font-bold text-charcoal hover:bg-cream transition-colors">
                  Show all {allVenues.length} venues
                </button>
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default VenuesHubPage;