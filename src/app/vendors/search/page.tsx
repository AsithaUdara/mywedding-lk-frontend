// src/app/vendors/search/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import AuthModal from '@/features/authentication/AuthModal';
import VendorCard from '@/features/vendor-discovery/components/VendorCard';
import { Filter } from 'lucide-react';
import FilterModal from '@/features/vendor-discovery/components/FilterModal';
import { getVendors } from '@/lib/api/vendors';
import { Vendor } from '@/lib/api/vendors';

const VENDORS_PER_LOAD = 9;

const SearchResultsPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  
  // State for all vendors fetched from the API
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1500000);

  // Pagination state
  const [displayedVendors, setDisplayedVendors] = useState<Vendor[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch data from the API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const vendorsData = await getVendors();
        setAllVendors(vendorsData);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Get all categories from fetched vendors
  const allCategories = useMemo(() => {
    if (allVendors.length === 0) return [];
    return Array.from(new Set(allVendors.map(v => v.categoryName)));
  }, [allVendors]);

  // Filter handlers
  const handleCategoryChange = (category: string) => setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  const handleRatingChange = (rating: number) => setSelectedRatings(prev => prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]);

  // Memoized filtering logic
  const filteredVendors = useMemo(() => {
    return allVendors.filter(vendor => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(vendor.categoryName);
      const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(Math.floor(vendor.averageRating));
      return categoryMatch && ratingMatch;
    });
  }, [allVendors, selectedCategories, selectedRatings]);

  // Effect to handle loading vendors when filters change
  useEffect(() => {
    setDisplayedVendors(filteredVendors.slice(0, VENDORS_PER_LOAD));
    setHasMore(filteredVendors.length > VENDORS_PER_LOAD);
  }, [filteredVendors]);

  // Function to load more vendors
  const loadMoreVendors = () => {
    const currentLength = displayedVendors.length;
    const nextVendors = filteredVendors.slice(currentLength, currentLength + VENDORS_PER_LOAD);
    setDisplayedVendors(prev => [...prev, ...nextVendors]);
    setHasMore(filteredVendors.length > currentLength + VENDORS_PER_LOAD);
  };

  // URL for the map on this page
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=AIzaSyAZXfMfsfRyCaPwkugdAlXNobgPHIQsH30&q=wedding+vendors+in+Colombo+Sri+Lanka`;

  return (
    <>
      <main className="bg-white">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
              {isLoading ? "Searching for vendors..." : `${filteredVendors.length} Vendors Found`}
            </h1>
            <button onClick={() => setFilterModalOpen(true)} className="flex items-center gap-2 border rounded-full px-5 py-3 font-semibold hover:shadow-lg transition-shadow">
              <Filter size={18}/> Show Filters
            </button>
          </div>

          <div className="flex">
            <div className="w-full md:w-3/5 lg:w-7/12 md:pr-8">
              {isLoading ? (
                <p className="text-gray-600">Loading vendors...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {displayedVendors.map(vendor => (
                    <VendorCard 
                      key={vendor.userId} 
                      vendor={{
                        id: vendor.userId,
                        name: vendor.businessName,
                        category: vendor.categoryName,
                        location: vendor.city,
                        images: ["https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80"],
                        rating: vendor.averageRating,
                        price: 0,
                      }} 
                    />
                  ))}
                </div>
              )}
              
              {hasMore && !isLoading && (
                <div className="text-center py-10 col-span-full">
                  <button onClick={loadMoreVendors} className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300" style={{ backgroundColor: 'var(--color-primary)' }}>
                    Show More
                  </button>
                </div>
              )}
            </div>
            <div className="hidden md:block w-2/5 lg:w-5/12">
              <div className="sticky top-28 h-[80vh] bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
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