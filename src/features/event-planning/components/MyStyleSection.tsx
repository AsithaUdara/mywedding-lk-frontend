// File: src/features/event-planning/components/MyStyleSection.tsx
"use client";

import React from 'react';
import { Sparkles, Edit, RefreshCw } from 'lucide-react';
import { useUI } from '@/context/UIContext';

const MyStyleSection = ({ preferences, onRefresh, onOpenQuiz }: { preferences: Record<string, string> | null; onRefresh?: () => void; onOpenQuiz?: () => void }) => {
  const { openChat } = useUI();

  const handleChatNowClick = () => {
    console.log('🤖 Opening AI Chatbot with preferences:', preferences);
    openChat();
  };
  if (!preferences) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        <p className="text-gray-500">You haven't set your style preferences yet.</p>
        <div className="flex gap-3 justify-center mt-4">
          <button 
            onClick={onOpenQuiz}
            className="font-semibold text-primary hover:underline"
          >
            Take the Style Quiz
          </button>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="flex items-center gap-1 font-semibold text-gray-500 hover:text-primary transition-colors"
              title="Refresh to load saved preferences"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary" size={24} />
          <h2 className="text-2xl font-semibold text-charcoal">My Wedding Style</h2>
        </div>
        <button 
          onClick={onOpenQuiz}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline hover:scale-105 transition-transform"
        >
          <Edit size={14} />
          <span>Edit</span>
        </button>
      </div>

      {/* Displaying the Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="p-3 bg-cream/60 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{key}</p>
            <p className="font-semibold text-charcoal capitalize mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* AI Chatbot Call to Action */}
      <div className="p-4 bg-gradient-to-r from-primary/80 to-accent/80 rounded-lg text-white flex items-center justify-between">
        <div>
          <h3 className="font-bold">Need Vendor Recommendations?</h3>
          <p className="text-sm opacity-90">Chat with our AI Assistant to get personalized suggestions based on your style.</p>
        </div>
        <button 
          onClick={handleChatNowClick}
          className="bg-white text-primary font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform whitespace-nowrap"
        >
          Chat Now
        </button>
      </div>
    </div>
  );
};

export default MyStyleSection;
