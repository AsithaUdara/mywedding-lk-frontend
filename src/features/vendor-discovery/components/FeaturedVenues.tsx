// src/components/FeaturedVenues.tsx
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

// Sample data for featured venues
const venues = [
  {
    name: "Galle Face Hotel",
    location: "Colombo, Sri Lanka",
    imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Heritance Kandalama",
    location: "Dambulla, Sri Lanka",
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Shangri-La Colombo",
    location: "Colombo, Sri Lanka",
    // --- THIS IS THE NEW, WORKING IMAGE URL ---
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },

  {
    name: "Jetwing Lighthouse",
    location: "Galle, Sri Lanka",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  },
];

const FeaturedVenues = () => {
  return (
    <section style={{ backgroundColor: 'var(--color-cream)' }} className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Title & View All Link */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-5xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
            Featured Venues
          </h2>
          <a href="#" className="flex items-center text-lg font-semibold hover:text-accent transition-colors" style={{ color: 'var(--color-primary)' }}>
            View All
            <ArrowRight className="ml-2" size={20} />
          </a>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {venues.map((venue) => (
            <div key={venue.name} className="group cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <div className="relative w-full h-56">
                <Image 
                  src={venue.imageUrl} 
                  alt={venue.name} 
                  layout="fill" 
                  objectFit="cover" 
                  className="group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-charcoal)' }}>{venue.name}</h3>
                <p className="text-gray-600">{venue.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVenues;