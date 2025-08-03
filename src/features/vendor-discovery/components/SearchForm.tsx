// src/features/vendor-discovery/components/SearchForm.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import SearchableDropdown from '@/components/ui/SearchableDropdown';
import allVendorsData from '@/lib/data/vendors.json';

// Define the props the component will receive
interface SearchFormProps {
  type: 'vendor' | 'venue';
}

const SearchForm = ({ type }: SearchFormProps) => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // Use useMemo for performance, so we don't recalculate on every render
  const { title, allCategories, allLocations } = useMemo(() => {
    const locations = Array.from(new Set(allVendorsData.map(v => v.location)));
    if (type === 'venue') {
      return {
        title: 'Find a Venue',
        allCategories: Array.from(new Set(allVendorsData.filter(v => v.category === 'Venues').map(v => v.name))),
        allLocations: locations
      };
    }
    // Default to 'vendor'
    return {
      title: 'Find a Vendor',
      allCategories: Array.from(new Set(allVendorsData.filter(v => v.category !== 'Venues').map(v => v.category))),
      allLocations: locations
    };
  }, [type]);

  // We will build the search URL with query parameters later
  const searchUrl = `/vendors/search?category=${category}&location=${location}`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full">
      <h1 className="text-4xl font-bold text-charcoal">{title}</h1>
      <p className="text-gray-500 mt-2 mb-6">Discover and book the perfect choice for your day.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {type === 'venue' ? 'VENUE NAME' : 'CATEGORY / VENDOR'}
          </label>
          <SearchableDropdown options={allCategories} placeholder={type === 'venue' ? 'e.g., Galle Face Hotel' : 'e.g., Photographers'} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">LOCATION</label>
          <SearchableDropdown options={allLocations} placeholder="e.g., Colombo" />
        </div>
      </div>

      <Link href="/vendors/search">
        <button type="button" className="w-full mt-6 py-4 rounded-lg text-white font-semibold flex items-center justify-center elegant-lift-button" style={{ backgroundColor: 'var(--color-primary)' }}>
          <Search size={20} className="mr-2"/> Search
        </button>
      </Link>
    </div>
  );
};

export default SearchForm;