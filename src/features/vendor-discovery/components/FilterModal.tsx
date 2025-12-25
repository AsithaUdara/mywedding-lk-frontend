// src/components/FilterModal.tsx
import React from 'react';
import { X, Star } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCategories: string[];
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
  selectedRatings: number[];
  handleRatingChange: (rating: number) => void;
  priceRange: number;
  setPriceRange: (price: number) => void;
  vendorCount: number;
  onShowResults: () => void;
}

const FilterModal = ({ isOpen, onClose, allCategories, selectedCategories, handleCategoryChange, selectedRatings, handleRatingChange, priceRange, setPriceRange, vendorCount, onShowResults }: FilterModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col" style={{ height: '90vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
          <h2 className="text-xl font-bold">Filters</h2>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Body */}
        <div className="flex-grow p-8 overflow-y-auto">
          {/* Price Range Filter */}
          <div className="pb-8 border-b">
            <h3 className="text-2xl font-semibold mb-4">Price Range</h3>
            <p className="text-lg text-gray-700 mb-4">Up to: <span className="font-bold" style={{ color: 'var(--color-primary)'}}>LKR {priceRange.toLocaleString()}</span></p>
            <input 
              type="range" 
              min="50000" 
              max="1500000" 
              step="50000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Category Filter */}
          <div className="py-8 border-b">
            <h3 className="text-2xl font-semibold mb-4">Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allCategories.map(category => (
                <label key={category} className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-charcoal transition-colors">
                  <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => handleCategoryChange(category)} className="h-5 w-5 rounded mr-3"/>
                  <span className="font-medium">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="py-8">
            <h3 className="text-2xl font-semibold mb-4">Rating</h3>
            <div className="flex space-x-4">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className={`flex items-center justify-center w-full p-4 border rounded-lg cursor-pointer hover:border-charcoal transition-colors ${selectedRatings.includes(rating) ? 'border-charcoal bg-cream' : ''}`}>
                  <input type="checkbox" checked={selectedRatings.includes(rating)} onChange={() => handleRatingChange(rating)} className="sr-only"/>
                  <span className="font-medium">{rating}</span>
                  <Star size={16} className="ml-2 text-accent" fill="currentColor"/>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t">
          <button 
            onClick={onShowResults}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Show {vendorCount} Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;