// src/components/layout/HeaderDropdown.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Music, Utensils, Flower2 } from 'lucide-react';

const vendorCategories = [
  { name: 'Photographers', href: '/vendors/search?category=Photographers', icon: <Camera size={20}/> },
  { name: 'Music Bands', href: '/vendors/search?category=Music+Bands', icon: <Music size={20}/> },
  { name: 'Caterers', href: '/vendors/search?category=Caterers', icon: <Utensils size={20}/> },
  { name: 'Florists', href: '/vendors/search?category=Florists', icon: <Flower2 size={20}/> },
];

const HeaderDropdown = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-2xl p-4"
    >
      <div className="space-y-2">
        {vendorCategories.map(cat => (
          // THE FIX: Removed the <a> tag and applied its classes to the Link component
          <Link 
            key={cat.name} 
            href={cat.href}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-cream transition-colors"
          >
            <div className="text-primary">{cat.icon}</div>
            <span className="font-semibold text-charcoal">{cat.name}</span>
          </Link>
        ))}
        <hr className="my-2"/>
        <Link 
          href="/vendors"
          className="block text-center font-bold text-primary p-2 hover:bg-cream rounded-lg"
        >
          Browse All Vendors
        </Link>
      </div>
    </motion.div>
  );
};

export default HeaderDropdown;