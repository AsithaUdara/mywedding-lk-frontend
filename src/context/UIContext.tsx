// File: src/context/UIContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  chatEventId: string | null;
  setChatEventId: (eventId: string | null) => void;
  isHubOpen: boolean;
  openHub: () => void;
  closeHub: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatEventId, setChatEventId] = useState<string | null>(null);
  const [isHubOpen, setHubOpen] = useState(false);

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const openHub = () => setHubOpen(true);
  const closeHub = () => setHubOpen(false);

  const value = { isChatOpen, openChat, closeChat, chatEventId, setChatEventId, isHubOpen, openHub, closeHub };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
