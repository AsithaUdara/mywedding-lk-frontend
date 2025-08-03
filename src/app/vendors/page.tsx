// src/app/vendors/page.tsx
"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthModal from '@/features/authentication/AuthModal';
import VendorCard from '@/features/vendor-discovery/components/VendorCard';
import SearchForm from '@/features/vendor-discovery/components/SearchForm';
import allVendorsData from '@/lib/data/vendors.json';
import Image from 'next/image';

const VendorsHubPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  const topRatedVendors = allVendorsData.filter(v => v.rating >= 4.9);
  const venues = allVendorsData.filter(v => v.category === 'Venues');

  return (
    <>
      <main className="bg-white">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        <section className="relative flex items-center" style={{height: '550px'}}>
          <div className="absolute inset-0">
            <Image 
              src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80" 
              alt="Beautiful Wedding Venue" 
              layout="fill" 
              objectFit="cover" 
              priority
            />
          </div>
          <div className="relative container mx-auto px-4">
            <SearchForm />
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <section>
            <h2 className="text-4xl font-bold text-charcoal mb-8">Top-rated vendors in Sri Lanka</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {topRatedVendors.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-4xl font-bold text-charcoal mb-8">Iconic Venues</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {venues.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
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