"use client";

import React from 'react';
import { Sparkles, Edit, RefreshCw } from 'lucide-react';
import { useUI } from '@/shared/context/UIContext';

const MyStyleSection = ({ preferences, onRefresh, onOpenQuiz }: { preferences: Record<string, string> | null; onRefresh?: () => void; onOpenQuiz?: () => void }) => {
  const { openChat } = useUI();

  const handleChatNowClick = () => {
    openChat();
  };
  if (!preferences) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/60 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="text-primary/40" size={20} />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-4">You haven&apos;t set your style preferences yet.</p>
        <button
          onClick={onOpenQuiz}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary bg-primary/10 transition-colors duration-200 hover:bg-primary/20"
        >
          Take the Style Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="text-primary" size={16} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold font-playfair text-charcoal tracking-tight">My Style</h2>
        </div>
        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors"
        >
          <Edit size={12} strokeWidth={2.5} />
          <span>Edit</span>
        </button>
      </div>

      {/* Displaying the Preferences */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {Object.entries(preferences).slice(0, 4).map(([key, value]) => (
          <div key={key} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{key}</p>
            <p className="text-sm font-bold text-charcoal capitalize truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* AI Chatbot Call to Action */}
      <div className="p-4 rounded-xl relative overflow-hidden group cursor-pointer" onClick={handleChatNowClick}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#8b0513] transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col gap-3">
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Need Vendor Recommendations?</h3>
            <p className="text-xs text-white/80 leading-relaxed">Get personalized suggestions instantly.</p>
          </div>
          <button className="self-start text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-lg shadow-sm transition-transform group-hover:scale-105">
            Chat Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyStyleSection;

