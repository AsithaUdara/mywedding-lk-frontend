"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserDropdown = () => {
  const { user, logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const getInitials = (displayName: string | null, email: string | null) => {
    if (displayName) {
        const names = displayName.split(' ');
        if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        return displayName.substring(0, 1).toUpperCase();
    }
    if (email) return email.substring(0, 1).toUpperCase();
    return 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 text-primary font-bold">
          {user.photoURL ? (
            <img src={user.photoURL} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{getInitials(user.displayName, user.email)}</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Styled like the Vendor Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl p-4 origin-top-right"
          >
            <div className="pb-3 border-b border-gray-100 mb-2">
              <p className="font-bold text-charcoal truncate">{user.displayName || 'Welcome'}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-cream transition-colors">
                <div className="text-primary"><LayoutDashboard size={20} /></div>
                <span className="font-semibold text-charcoal">Dashboard</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-cream transition-colors">
                <div className="text-primary"><Settings size={20} /></div>
                <span className="font-semibold text-charcoal">Account Settings</span>
              </Link>
              <hr className="my-1"/>
              <button onClick={logOut} className="flex items-center w-full text-left space-x-3 p-3 rounded-lg hover:bg-cream transition-colors">
                <div className="text-primary"><LogOut size={20} /></div>
                <span className="font-semibold text-charcoal">Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;