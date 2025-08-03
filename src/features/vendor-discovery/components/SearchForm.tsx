// src/components/SearchForm.tsx
import React from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import SearchableDropdown from '../../../components/ui/SearchableDropdown'; // Import the new component
import allVendorsData from '@/lib/data/vendors.json';

// Prepare the unique options for our dropdowns
const allCategories = Array.from(new Set(allVendorsData.map(v => v.category)));
const allLocations = Array.from(new Set(allVendorsData.map(v => v.location)));

const SearchForm = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full">
      <h1 className="text-4xl font-bold text-charcoal">Find a Vendor</h1>
      <p className="text-gray-500 mt-2 mb-6">Discover and book the perfect vendors for your day.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">CATEGORY / VENDOR</label>
          <SearchableDropdown options={allCategories} placeholder="e.g., Photographers" />
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