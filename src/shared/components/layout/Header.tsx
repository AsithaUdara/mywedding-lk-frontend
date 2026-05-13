"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/shared/context/AuthContext';
import { ShoppingCart, Heart, Search, Menu, X, ChevronDown } from 'lucide-react';
import Logo from '@/assets/MyWedding.png';
import HeaderDropdown from './HeaderDropdown';
import UserDropdown from './UserDropdown';
import { AnimatePresence } from 'framer-motion';
import AuthModal from '@/modules/identity/AuthModal';

interface HeaderProps {
    onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isVendorDropdownOpen, setVendorDropdownOpen] = useState(false);

    const handleLoginClick = () => {
        if (onLoginClick) {
            onLoginClick();
        } else {
            setModalOpen(true);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-md border-b border-black/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo Section */}
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                        <div className="w-[120px] md:w-[160px] h-auto">
                            <Image 
                                src={Logo} 
                                alt="MyWedding.lk Logo" 
                                width={160} 
                                height={40} 
                                className="w-full h-auto"
                                priority 
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-charcoal font-medium">
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
                    </nav>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors hidden sm:block">
                            <Search size={20} />
                        </button>
                        <button className="p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors">
                            <Heart size={20} />
                        </button>

                        {user ? (
                            <UserDropdown />
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                            >
                                Login
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-charcoal hover:bg-black/5 rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
                        <nav className="flex flex-col p-4 space-y-4">
                            <Link href="/vendors" className="text-lg font-bold font-playfair text-charcoal p-2">Vendors</Link>
                            <Link href="/venues" className="text-lg font-bold font-playfair text-charcoal p-2">Venues</Link>
                            <Link href="/inspiration" className="text-lg font-bold font-playfair text-charcoal p-2">Inspiration</Link>
                            <Link href="/search" className="flex items-center gap-2 text-lg font-bold font-playfair text-charcoal p-2">
                                <Search size={20} /> Search
                            </Link>
                        </nav>
                    </div>
                )}
            </header>
            {!user && <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />}
        </>
    );
};

export default Header;

