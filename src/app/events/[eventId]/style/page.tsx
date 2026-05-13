"use client";

import React from 'react';
import MyStyleSection from '@/modules/events/MyStyleSection';

export default function StylePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Passing dummy data for now, as the real data fetch was not fully implemented in the original file anyway */}
      <MyStyleSection 
        preferences={{ Style: 'Traditional', Photography: 'Candid', Priority: 'Food' }} 
        onOpenQuiz={() => {}} 
      />
    </div>
  );
}
