// src/app/vendors/search/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import AuthModal from '@/features/authentication/AuthModal';
import VendorCard from '@/features/vendor-discovery/components/VendorCard';
import allVendorsData from '@/lib/data/vendors.json';
import { Filter } from 'lucide-react';
import FilterModal from '@/features/vendor-discovery/components/FilterModal';

interface Vendor {
  id: number; name: string; category: string; location: string; images: string[];
  rating: number; reviews: number; price: number; tags: string[]; description: string;
}

const VENDORS_PER_LOAD = 4;

const SearchResultsPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1500000);

  const [displayedVendors, setDisplayedVendors] = useState<Vendor[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  const allCategories = useMemo(() => Array.from(new Set(allVendorsData.map(v => v.category))), []);

  const handleCategoryChange = (category: string) => setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  const handleRatingChange = (rating: number) => setSelectedRatings(prev => prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]);

  const filteredVendors = useMemo(() => {
    return allVendorsData.filter(vendor => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(vendor.category);
      const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(Math.round(vendor.rating));
      const priceMatch = vendor.price <= priceRange;
      return categoryMatch && ratingMatch && priceMatch;
    });
  }, [selectedCategories, selectedRatings, priceRange]);

  useEffect(() => {
    setDisplayedVendors(filteredVendors.slice(0, VENDORS_PER_LOAD));
    setHasMore(filteredVendors.length > VENDORS_PER_LOAD);
  }, [filteredVendors]);

  const loadMoreVendors = () => {
    const currentLength = displayedVendors.length;
    const nextVendors = filteredVendors.slice(currentLength, currentLength + VENDORS_PER_LOAD);
    setDisplayedVendors(prev => [...prev, ...nextVendors]);
    setHasMore(filteredVendors.length > currentLength + VENDORS_PER_LOAD);
  };

  return (
    <>
      <main className="bg-white">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
              {filteredVendors.length} Vendors Found
            </h1>
            <button onClick={() => setFilterModalOpen(true)} className="flex items-center gap-2 border rounded-full px-5 py-3 font-semibold hover:shadow-lg transition-shadow">
              <Filter size={18}/> Show Filters
            </button>
          </div>

          <div className="flex">
            <div className="w-full md:w-3/5 lg:w-7/12 md:pr-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                {displayedVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center py-10 col-span-full">
                  <button onClick={loadMoreVendors} className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300" style={{ backgroundColor: 'var(--color-primary)' }}>
                    Show More
                  </button>
                </div>
              )}
            </div>
            <div className="hidden md:block w-2/5 lg:w-5/12">
              <div className="sticky top-28 h-[80vh] bg-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Map Area</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} allCategories={allCategories} selectedCategories={selectedCategories} handleCategoryChange={handleCategoryChange} selectedRatings={selectedRatings} handleRatingChange={handleRatingChange} priceRange={priceRange} setPriceRange={setPriceRange} vendorCount={filteredVendors.length} onShowResults={() => setFilterModalOpen(false)} />
    </>
  );
};

export default SearchResultsPage;