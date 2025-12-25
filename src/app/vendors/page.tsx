// src/app/vendors/page.tsx
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
import AmenityCard from '@/features/vendor-discovery/components/AmenityCard';

// Page-Specific Components (Co-located)
import HeroWithSearch from './components/HeroWithSearch';

// Data & Icons
import allVendorsData from '@/lib/data/vendors.json';
import { Star, Camera, Music } from 'lucide-react';

const VendorsHubPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  const topRatedVendors = allVendorsData.filter(v => v.rating >= 4.9 && v.category !== 'Venues');
  const allVendors = allVendorsData.filter(v => v.category !== 'Venues');

  const styleCategories = [
    { title: 'Luxury Venues', subtitle: 'Grand hotels and beautiful estates', imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80' },
    { title: 'Candid Photography', subtitle: 'Capturing authentic, timeless moments', imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80' },
    { title: 'Tropical Florists', subtitle: 'Vibrant, exotic arrangements', imageUrl: 'https://images.unsplash.com/photo-1654532388036-967f71e1e92e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  ];
  
  const popularAmenities = [
    { title: '5-star Rated', icon: <Star size={24} /> },
    { title: 'Drone Photography', icon: <Camera size={24} /> },
    { title: 'Live Music', icon: <Music size={24} /> },
  ];

  return (
    <>
      <main className="bg-white">
        <Header onLoginClick={() => setAuthModalOpen(true)} />

        <HeroWithSearch 
          imageUrl="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80"
          searchType="vendor"
        />

        <div className="container mx-auto px-4 py-16 space-y-20">
          
          <HorizontalScrollSection title="Top-rated vendors in Sri Lanka" subtitle="Guests agree: these vendors are highly rated for their service and quality.">
            {topRatedVendors.map(vendor => (
              <div key={vendor.id} className="flex-shrink-0" style={{ width: 'calc(25% - 18px)' }}>
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </HorizontalScrollSection>

          <section>
            <h2 className="text-4xl font-bold text-charcoal mb-8">Services for every style</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {styleCategories.map(style => <StyleCard key={style.title} {...style} />)}
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-bold text-charcoal mb-8">Popular features and services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {popularAmenities.map(amenity => <AmenityCard key={amenity.title} {...amenity} />)}
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-bold text-charcoal mb-8">All Vendors in Sri Lanka</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {allVendors.slice(0, 8).map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/vendors/search">
                <button className="px-8 py-4 border-2 border-charcoal rounded-lg font-bold text-charcoal hover:bg-cream transition-colors">
                  Show all {allVendors.length} vendors
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

export default VendorsHubPage;