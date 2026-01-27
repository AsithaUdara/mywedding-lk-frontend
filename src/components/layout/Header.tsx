// src/components/layout/Header.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Search, User, ChevronDown } from 'lucide-react';
import Logo from '@/assets/MyWedding.png';
import HeaderDropdown from './HeaderDropdown';
import UserDropdown from './UserDropdown';
import AuthModal from '@/features/authentication/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';

type HeaderProps = { onLoginClick?: () => void };

const Header = ({ onLoginClick }: HeaderProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isVendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-md border-b border-black/10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-1 px-4 sm:px-6 lg:px-8">
          
          <div className="flex-1 flex justify-start">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image src={Logo} alt="MyWedding.lk Logo" width={90} height={23} priority />
            </Link>
          </div>
          
          <nav className="hidden md:flex justify-center items-center space-x-8 text-charcoal font-medium">
            <div 
              className="relative"
              onMouseEnter={() => setVendorDropdownOpen(true)}
              onMouseLeave={() => setVendorDropdownOpen(false)}
            >
              <Link href="/vendors" className="flex items-center gap-1 hover:text-accent transition-colors duration-200 py-2">
                Vendors
                <ChevronDown size={16} className={`transition-transform duration-300 ${isVendorDropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              <AnimatePresence>
                {isVendorDropdownOpen && <HeaderDropdown />}
              </AnimatePresence>
            </div>
            <Link href="/venues" className="hover:text-accent transition-colors duration-200 py-2">Venues</Link>
            <Link href="/inspiration" className="hover:text-accent transition-colors duration-200 py-2">Inspiration</Link>
            <Link href="/checklist" className="hover:text-accent transition-colors duration-200 py-2">Checklist</Link>
          </nav>
          
          <div className="flex-1 flex items-center justify-end space-x-2">
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors duration-200"><Search size={18} /></button>
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors duration-200"><Heart size={18} /></button>
            
            {user ? (
              <UserDropdown />
            ) : (
              <button 
                onClick={() => (onLoginClick ? onLoginClick() : setModalOpen(true))} 
                className="flex items-center space-x-2 rounded-full px-5 py-1.5 text-sm font-semibold text-white hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <User size={18}/>
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {!user && <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default Header;
