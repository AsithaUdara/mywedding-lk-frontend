"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot, Loader2, Maximize2, Minimize2, Minus, MessageCircle } from 'lucide-react';

import { useUI } from '@/context/UIContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AIChatWidget = () => {
  const { isChatOpen, openChat, closeChat } = useUI();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show tooltip after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isChatOpen) setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isChatOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isChatOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI Response after a delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "That's a great question! Since your priority is Food, I'd highly recommend looking into 'Royal Catering' or 'The Grand Banquet'. Would you like me to add a task to your checklist to contact them?"
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
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
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {/* Tooltip bubble */}
        <AnimatePresence>
          {showTooltip && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-primary/10 text-xs font-bold text-charcoal flex items-center gap-2 whitespace-nowrap mb-1"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ask AI for Recommendations
              <button onClick={() => setShowTooltip(false)} className="ml-1 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={isChatOpen ? closeChat : openChat}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary to-[#7a1b32] text-white shadow-[0_12px_40px_rgba(139,26,55,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          whileHover={{ y: -4 }}
        >
          {/* Pulsing ring effect */}
          {!isChatOpen && (
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-[ping_2s_infinite] opacity-40" />
          )}
          
          <div className="relative">
            {isChatOpen ? (
              <X size={28} />
            ) : (
              <>
                <MessageCircle size={28} strokeWidth={2.5} />
                <div className="absolute -top-1 -right-1 bg-white text-primary rounded-full p-0.5 shadow-sm border border-primary/10">
                  <Sparkles size={12} fill="currentColor" />
                </div>
              </>
            )}
          </div>
        </motion.button>
      </div>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMaximized ? 'calc(100vw - 4rem)' : '380px',
              height: isMaximized ? 'calc(100vh - 8rem)' : '600px',
              right: isMaximized ? '2rem' : '2rem',
              bottom: isMaximized ? '4rem' : '7rem'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={`fixed z-50 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgb(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden`}
            style={{ 
              right: '2rem', 
              bottom: isMaximized ? '4rem' : '7rem'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-[#7a1b32] p-5 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold font-playfair tracking-wide text-lg">AI Assistant</h3>
                  <p className="text-white/70 text-xs font-medium flex items-center gap-1">
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
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-charcoal text-white' : 'bg-primary/10 text-primary'}`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-charcoal text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                    {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className={msg.sender === 'user' ? 'text-white' : 'text-primary'}>{part}</strong> : part)}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/60 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/80 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              {/* Quick Chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                {suggestedChips.map(chip => (
                  <button 
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="whitespace-nowrap px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/10 rounded-full text-xs font-semibold tracking-wide"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary/50 focus:bg-white transition-colors placeholder:text-gray-400"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-300 transition-colors hover:bg-[#7a1b32]"
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
