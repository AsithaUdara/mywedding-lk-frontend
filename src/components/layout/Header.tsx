// src/components/Header.tsx
import React from 'react';
import Image from 'next/image';
import { Heart, Search, User } from 'lucide-react';
import Logo from '@/assets/MyWedding.png';

interface HeaderProps { onLoginClick: () => void; }

const Header = ({ onLoginClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-cream/95 backdrop-blur-md border-b border-black/10 shadow-sm">
      {/* FINAL & SLEEKEST: Minimal py-1 padding for the shortest possible header */}
      <div className="container mx-auto flex items-center justify-between py-1 px-4">
        
        {/* Left Column */}
        <div className="flex-1 flex justify-start">
          <a href="/" className="hover:opacity-80 transition-opacity">
            {/* FINAL: Logo sized to dictate the new minimal height */}
            <Image 
              src={Logo} 
              alt="MyWedding.lk Logo" 
              width={110} 
              height={28} 
              priority 
            />
          </a>
        </div>
        
        {/* Center Column */}
        <nav className="hidden md:flex justify-center items-center space-x-8 text-charcoal font-medium">
          <a href="/vendors" className="hover:text-accent transition-colors duration-200 py-2">Vendors</a>
          <a href="/venues" className="hover:text-accent transition-colors duration-200 py-2">Venues</a>
          <a href="/inspiration" className="hover:text-accent transition-colors duration-200 py-2">Inspiration</a>
          <a href="/checklist" className="hover:text-accent transition-colors duration-200 py-2">Checklist</a>
        </nav>
        
        {/* Right Column */}
        <div className="flex-1 flex items-center justify-end space-x-2">
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors duration-200"><Search size={18} /></button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors duration-200"><Heart size={18} /></button>
          
          {/* FINAL: Login button with minimal vertical padding */}
          <button 
            onClick={onLoginClick} 
            className="flex items-center space-x-2 rounded-full px-5 py-1.5 text-sm font-semibold text-white hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105" 
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <User size={18}/>
            <span>Log In</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;