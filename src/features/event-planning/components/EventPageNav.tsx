// File: src/features/event-planning/components/EventPageNav.tsx
"use client";

import React from 'react';
import { useUI } from '@/context/UIContext';
import { MessageSquare, LayoutGrid } from 'lucide-react';

const EventPageNav = () => {
  const { openHub } = useUI();

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-8 flex items-center gap-2">
      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold bg-primary/10 text-primary">
        <LayoutGrid size={18} /> Activity
      </button>
      <button onClick={openHub} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-charcoal hover:bg-cream relative group">
        <div className="relative">
          <MessageSquare size={18} />
          {/* Notification Badge */}
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110">
            3
          </span>
        </div>
        Team Chat
      </button>
    </div>
  );
};

export default EventPageNav;
