"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot, Loader2, Maximize2, Minimize2, Minus } from 'lucide-react';

import { useUI } from '@/shared/context/UIContext';
import { useAuth } from '@/shared/context/AuthContext';
import { getEvents } from '@/shared/lib/api/events';
import { sendAiChat } from '@/shared/lib/api/ai';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AIChatWidget = () => {
  const { isChatOpen, openChat, closeChat } = useUI();
  const { user } = useAuth();
  const [isMaximized, setIsMaximized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi there! I see your style is **Traditional** and your top priority is **Food**. I'm your AI Wedding Assistant. How can I help you plan your dream wedding today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show tooltip after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isChatOpen) setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isChatOpen]);

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const events = await getEvents(token);
        if (events && events.length > 0) {
          setActiveEventId(events[0].id);
        }
      } catch {
        // ignore; widget gracefully falls back
      }
    };
    loadEvent();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isChatOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      if (!user || !activeEventId) {
        throw new Error("No active event found. Create an event to use AI planning.");
      }

      const token = await user.getIdToken();
      const ai = await sendAiChat(token, activeEventId, inputValue);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: ai.reply || "I could not generate a response right now."
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: err instanceof Error ? err.message : "AI service is temporarily unavailable."
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const suggestedChips = ["Suggest Photographers", "Budget Advice", "Create a task list"];

  const handleChipClick = (text: string) => {
    setInputValue(text);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* Tooltip bubble */}
        <AnimatePresence>
          {showTooltip && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="rf-glass-subtle vgo-glass-subtle px-4 py-2 rounded-2xl shadow-xl border border-white/55 text-xs font-bold text-foreground flex items-center gap-2 whitespace-nowrap mb-1 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ask AI for Recommendations
              <button onClick={() => setShowTooltip(false)} className="ml-1 text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={isChatOpen ? closeChat : openChat}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_8px_25px_rgba(139,26,55,0.3)] transition-all hover:scale-110 active:scale-95"
          whileHover={{ y: -4 }}
        >
          {/* Subtle pulse effect */}
          {!isChatOpen && (
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-[ping_3s_infinite] opacity-20" />
          )}
          
          <div className="relative">
            {isChatOpen ? (
              <X size={20} />
            ) : (
              <Sparkles size={22} fill="currentColor" className="text-primary-foreground" />
            )}
          </div>
        </motion.button>
      </div>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ 
              opacity: 0, 
              y: 50, 
              scale: 0.9, 
              originX: 1, 
              originY: 1,
              right: isMobile ? 0 : '2rem',
              bottom: isMobile ? 0 : '7rem'
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMobile ? '100vw' : (isMaximized ? 'calc(100vw - 4rem)' : '380px'),
              height: isMobile ? '100vh' : (isMaximized ? 'calc(100vh - 8rem)' : '600px'),
              right: isMobile ? '0px' : (isMaximized ? '2rem' : '2rem'),
              bottom: isMobile ? '0px' : (isMaximized ? '4rem' : '7rem'),
              borderRadius: isMobile ? '0px' : '24px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={`fixed z-[110] rf-glass-panel vgo-glass-panel border border-white/55 bg-white/40 shadow-[0_20px_60px_-15px_rgb(0,0,0,0.12)] backdrop-blur-xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-primary to-primary/85 p-5 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold font-playfair tracking-wide text-lg">AI Assistant</h3>
                  <p className="flex items-center gap-1 text-xs font-medium text-primary-foreground/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={closeChat}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  title="Minimize"
                >
                  <Minus size={18} />
                </button>
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={closeChat}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/20 backdrop-blur-sm">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${msg.sender === "user" ? "bg-primary/30 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.sender === "user" ? "rounded-tr-none bg-primary text-primary-foreground" : "rounded-tl-none border border-white/55 bg-white/50 text-foreground backdrop-blur-sm"}`}
                  >
                    {msg.text.split("**").map((part, i) =>
                      i % 2 === 1 ? (
                        <strong
                          key={i}
                          className={msg.sender === "user" ? "text-primary-foreground" : "text-primary"}
                        >
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white/50 border border-white/55 p-4 rounded-2xl rounded-tl-none shadow-sm backdrop-blur-sm flex gap-1 items-center">
                    <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/60 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/80 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/30 border-t border-white/40 flex-shrink-0 backdrop-blur-sm">
              {/* Quick Chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                {suggestedChips.map(chip => (
                  <button 
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="whitespace-nowrap px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/15 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Ask anything about your wedding..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="w-full bg-white/40 border border-white/55 rounded-full py-3 pl-4 pr-12 text-sm backdrop-blur-sm focus:outline-none focus:border-primary/50 focus:bg-white/55 transition-colors placeholder:text-muted-foreground"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-muted disabled:opacity-50"
                >
                  {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;

