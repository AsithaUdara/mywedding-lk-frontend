// src/components/BrowseByCategory.tsx
import React from 'react';
import { Camera, MapPin, Utensils, Music, Flower2, Clapperboard } from 'lucide-react';

// Data for our categories - easy to add or change later
const categories = [
  { name: 'Photographers', icon: <Camera size={32} /> },
  { name: 'Venues', icon: <MapPin size={32} /> },
  { name: 'Caterers', icon: <Utensils size={32} /> },
  { name: 'Music Bands', icon: <Music size={32} /> },
  { name: 'Florists', icon: <Flower2 size={32} /> },
  { name: 'Videographers', icon: <Clapperboard size={32} /> },
];

const BrowseByCategory = () => {
  return (
    <section style={{ backgroundColor: 'var(--color-cream)' }} className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
            Everything You Need
          </h2>
          <p className="text-lg mt-3 text-gray-600">
            Find the best vendors for every aspect of your wedding.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category) => (
            <div 
              key={category.name}
              className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div 
                className="text-primary group-hover:scale-110 transition-transform duration-300"
                style={{ color: 'var(--color-primary)' }}
              >
                {category.icon}
              </div>
              <h3 
                className="mt-4 text-lg font-semibold text-center group-hover:text-accent transition-colors duration-300" 
                style={{ color: 'var(--color-charcoal)' }}
              >
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategory;