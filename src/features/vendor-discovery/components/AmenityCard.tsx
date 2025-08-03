// src/features/vendor-discovery/components/AmenityCard.tsx
import React from 'react';
import { Wifi, Star, Image as ImageIcon } from 'lucide-react'; // Example icons

interface AmenityCardProps { title: string; icon: React.ReactNode; }

const AmenityCard = ({ title, icon }: AmenityCardProps) => {
  return (
    <div className="p-6 border rounded-xl flex items-center space-x-4 hover:shadow-lg transition-shadow cursor-pointer">
      {icon}
      <span className="font-semibold text-charcoal">{title}</span>
    </div>
  );
};

export default AmenityCard;