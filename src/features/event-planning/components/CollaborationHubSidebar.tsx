// File: src/features/event-planning/components/CollaborationHubSidebar.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { getConversations, getMessages, postMessage, Conversation, Message } from '@/lib/api/events';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Hash } from 'lucide-react';

const CollaborationHubSidebar = ({ eventId }: { eventId: string }) => {
  const { isHubOpen, closeHub } = useUI();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getConversations(token, eventId);
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]); // Select the first channel by default
      }
    } catch (error) { console.error(error); }
  }, [user, eventId, selectedConversation]);

  useEffect(() => {
    if (isHubOpen) {
      fetchConversations();
    }
  }, [isHubOpen, fetchConversations]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !selectedConversation) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const data = await getMessages(token, selectedConversation.id);
        setMessages(data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchMessages();
  }, [user, selectedConversation]);

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim()) return;
    try {
      const token = await user.getIdToken();
      await postMessage(token, selectedConversation.id, newMessage);
      setNewMessage('');
      // Optimistic UI update
      const tempMessage: Message = { id: Date.now().toString(), content: newMessage, createdAt: new Date().toISOString(), senderId: user.uid, senderFirstName: user.displayName?.split(' ')[0] || 'You', senderLastName: '', attachment: null };
      setMessages(prev => [...prev, tempMessage]);
      // Re-fetch for consistency
      const data = await getMessages(token, selectedConversation.id);
      setMessages(data);
    } catch (error) { console.error(error); }
  };

  return (
    <AnimatePresence>
      {isHubOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeHub} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-full max-w-2xl bg-white z-[60] flex shadow-2xl">
            {/* Conversation List Panel */}
            <div className="w-1/3 bg-cream/60 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-charcoal">Channels</h2>
              </div>
              <div className="flex-grow p-2 space-y-1">
                {conversations.map(convo => (
                  <button key={convo.id} onClick={() => setSelectedConversation(convo)} className={`w-full flex items-center gap-2 p-2 rounded-md text-left font-semibold ${selectedConversation?.id === convo.id ? 'bg-primary/10 text-primary' : 'text-charcoal hover:bg-black/5'}`}>
                    <Hash size={16} /> {convo.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Message View Panel */}
            <div className="w-2/3 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-bold text-xl text-charcoal">{selectedConversation?.name || 'Loading...'}</h2>
                <button onClick={closeHub} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
              </div>
              <div className="flex-grow p-4 space-y-6 overflow-y-auto">
                {loading ? <p>Loading messages...</p> : messages.map(msg => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">{`${msg.senderFirstName?.[0] ?? ''}${msg.senderLastName?.[0] ?? ''}`.toUpperCase()}</div>
                    <div>
                      <p className="font-bold text-charcoal">{msg.senderFirstName} {msg.senderLastName} <span className="text-xs text-gray-400 font-normal">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                      <p className="text-gray-700">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handlePostMessage} className="p-4 border-t border-gray-200">
                <div className="relative">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={`Message in ${selectedConversation?.name || ''}`} className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent" />
                  <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-opacity-90"><Send size={18} /></button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollaborationHubSidebar;
