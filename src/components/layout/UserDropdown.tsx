// File: src/components/layout/UserDropdown.tsx
"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserDropdown = () => {
  const { user, logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // This hook handles closing the dropdown when clicking outside of it
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

  // Get user initials for the avatar
  const getInitials = (displayName: string | null, email: string | null) => {
    if (displayName) {
        const names = displayName.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return displayName.substring(0, 1).toUpperCase();
    }
    if (email) {
      return email.substring(0, 1).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* User Avatar and Arrow Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 rounded-full transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold border border-orange-200">
          {user.photoURL ? (
            <img src={user.photoURL} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{getInitials(user.displayName, user.email)}</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl p-2 origin-top-right border border-black/5"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              {/* === THE FIX IS HERE === */}
              <p className="text-sm font-semibold text-charcoal">
                Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="py-2">
              <Link href="/dashboard" className="flex items-center w-full px-3 py-2 text-sm text-charcoal rounded-md hover:bg-cream hover:text-primary transition-colors">
                <LayoutDashboard size={16} className="mr-3 text-gray-400" />
                Dashboard
              </Link>
              <Link href="/settings" className="flex items-center w-full px-3 py-2 text-sm text-charcoal rounded-md hover:bg-cream hover:text-primary transition-colors">
                <Settings size={16} className="mr-3 text-gray-400" />
                Account Settings
              </Link>
            </div>
            <div className="py-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOpen(false); // Close dropdown before logging out
                  logOut();
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-charcoal rounded-md hover:bg-cream hover:text-primary transition-colors"
              >
                <LogOut size={16} className="mr-3 text-gray-400" />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
