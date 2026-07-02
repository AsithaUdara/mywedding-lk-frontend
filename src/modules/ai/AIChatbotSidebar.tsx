// File: src/features/ai/AIChatbotSidebar.tsx
"use client";

import React, { useState } from 'react';
import { useUI } from '@/shared/context/UIContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChatbotSidebar = () => {
  const { isChatOpen, closeChat } = useUI();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Thank you for your message! This is where the AI response would appear. For now, this is a placeholder. Soon, your questions will be answered intelligently based on your wedding style preferences. 🎉',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-[60] flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={24} aria-hidden />
                <h2 className="font-playfair text-xl font-bold text-foreground">AI Wedding Assistant</h2>
              </div>
              <button
                onClick={closeChat}
                className="rounded-full p-2 transition-colors hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              {messages.length === 0 ? (
                // Welcome Message (shown only on first load)
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    AI
                  </div>
                  <div className="flex-1 rounded-lg rounded-tl-none bg-primary/5 p-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      Hi <span className="font-semibold">{user?.displayName?.split(' ')[0] || 'there'}</span>! 👋 I&apos;m your AI Wedding Assistant. Based on your style preferences, I can help you find the perfect vendors, plan your budget, and create an unforgettable celebration.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground">
                      What would you like help with? I can suggest:
                    </p>
                    <ul className="ml-3 mt-2 space-y-1 text-sm text-foreground">
                      <li>✨ Photography & Videography</li>
                      <li>🎂 Catering & Cakes</li>
                      <li>🎭 Decorations & Theme</li>
                      <li>💐 Flowers & Arrangements</li>
                    </ul>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''
                      }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg max-w-xs text-sm ${message.sender === 'user'
                          ? "rounded-tr-none bg-primary text-primary-foreground"
                          : "rounded-tl-none bg-muted text-foreground"
                        }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    AI
                  </div>
                  <div className="flex gap-1 rounded-lg rounded-tl-none bg-muted p-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0.1s" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="border-t border-border bg-muted/30 p-4">
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-lg border border-border py-3 pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="rounded-lg bg-primary p-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChatbotSidebar;
