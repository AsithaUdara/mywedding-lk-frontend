// src/components/Hero.tsx
import React from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';

const heroImageUrl = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';

const Hero = () => {
  return (
    // CHANGED: From 'items-center' to 'items-start' for top alignment control
    <section className="relative h-[600px] flex items-start justify-center text-white overflow-hidden" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Background Image & Overlay (No change) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImageUrl}
          alt="Elegant wedding decorations"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Magical particles & Curve (No change) */}
      <div className="absolute inset-0 z-5 magical-particles"></div>
      <div className="absolute bottom-[-1px] left-0 w-full z-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
          <path 
            fill="var(--color-cream)" 
            d="M0,100L1440,100L1440,20C1200,40 960,60 720,60C480,60 240,40 0,20Z"
          ></path>
        </svg>
      </div>

      {/* Content */}
      {/* CHANGED: Added 'pt-32' to push the entire content block down */}
      <div className="relative z-10 text-center px-4 pt-32">
        <h1 className="text-5xl md:text-7xl font-bold pb-4 wedding-title-animation">
          Your Dream Wedding, Simplified.
        </h1>
        <p 
          className="mt-4 text-lg animate-subtitle-appear" 
          style={{ color: 'var(--color-cream)' }}
        >
          Discover the best vendors, venues, and inspiration for your perfect day in Sri Lanka.
        </p>
        <div className="mt-8 mx-auto max-w-2xl search-bar-always-visible">
          <div className="flex items-center bg-white rounded-full shadow-2xl p-2 search-bar-enhanced">
            <input 
              type="text" 
              placeholder="Search for photographers, venues, caterers..."
              className="flex-grow bg-transparent outline-none px-4 placeholder-gray-400"
              style={{ color: 'var(--color-charcoal)' }}
            />
            <button 
              className="sword-button-enhanced text-white rounded-full p-3 hover:scale-110 transition-all duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Search size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;