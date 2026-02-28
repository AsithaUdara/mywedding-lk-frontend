// File: src/features/event-planning/components/CollaborationHubSidebar.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { getConversations, getMessages, postMessage, Conversation, Message } from '@/lib/api/events';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Hash, Vote, MessageSquare, Loader2 } from 'lucide-react';
import PollsSection from './PollsSection';

const CollaborationHubSidebar = ({ eventId }: { eventId: string }) => {
  const { isHubOpen, closeHub } = useUI();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'messages' | 'polls'>('messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const data = await getConversations(token, eventId);
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]); // Select the first channel by default
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Could not load channels. You may not be a member of this event yet.');
    } finally {
      setLoadingConversations(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId]);

  useEffect(() => {
    if (isHubOpen) {
      fetchConversations();
    }
  }, [isHubOpen, fetchConversations]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !selectedConversation) return;
      setLoadingMessages(true);
      try {
        const token = await user.getIdToken();
        const data = await getMessages(token, selectedConversation.id);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    if (activeTab === 'messages' && selectedConversation) {
      fetchMessages();
    }
  }, [user, selectedConversation, activeTab]);

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim() || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const token = await user.getIdToken();
      await postMessage(token, selectedConversation.id, messageContent);
      // Re-fetch messages after sending
      const data = await getMessages(token, selectedConversation.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(messageContent); // Restore message on failure
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <AnimatePresence>
      {isHubOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeHub} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-full max-w-2xl bg-white z-[60] flex shadow-2xl">
            {/* Left Panel: Tabs */}
            <div className="w-[72px] bg-charcoal flex flex-col items-center py-6 gap-4">
              <button
                onClick={() => setActiveTab('messages')}
                title="Messages"
                className={`p-3 rounded-2xl transition-all ${activeTab === 'messages' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <MessageSquare size={22} />
              </button>
              <button
                onClick={() => setActiveTab('polls')}
                title="Polls"
                className={`p-3 rounded-2xl transition-all ${activeTab === 'polls' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <Vote size={22} />
              </button>
            </div>

            {/* Middle Panel: Channels (Only if messages tab) */}
            {activeTab === 'messages' && (
              <div className="w-[180px] bg-slate-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-xs uppercase tracking-widest text-slate-400">Channels</h2>
                </div>
                <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                  {loadingConversations ? (
                    <div className="flex justify-center py-4">
                      <Loader2 size={16} className="animate-spin text-slate-300" />
                    </div>
                  ) : error ? (
                    <p className="text-[10px] text-red-400 p-2">{error}</p>
                  ) : conversations.length === 0 ? (
                    <p className="text-[10px] text-slate-400 p-2">No channels yet.</p>
                  ) : (
                    conversations.map(convo => (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConversation(convo)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-bold transition-all ${selectedConversation?.id === convo.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-black/5'}`}
                      >
                        <Hash size={14} className="opacity-60 flex-shrink-0" />
                        <span className="truncate">{convo.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Main Content View Panel */}
            <div className="flex-grow flex flex-col bg-white min-w-0">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
                <h2 className="font-bold text-xl text-charcoal flex items-center gap-2">
                  {activeTab === 'messages' ? (
                    <>
                      <Hash size={18} className="text-slate-400" />
                      {selectedConversation?.name || 'Messages'}
                    </>
                  ) : (
                    <>
                      <Vote size={18} className="text-primary" />
                      Team Polls
                    </>
                  )}
                </h2>
                <button onClick={closeHub} className="p-2 rounded-full hover:bg-gray-100 text-slate-400 transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-grow p-6 overflow-y-auto">
                {activeTab === 'messages' ? (
                  <div className="space-y-5">
                    {loadingMessages ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={24} className="animate-spin text-primary/40" />
                        <p className="text-sm text-slate-400">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <MessageSquare size={28} className="text-primary/50" />
                        </div>
                        <p className="font-bold text-slate-500">No messages yet</p>
                        <p className="text-sm text-slate-400">Be the first to say something!</p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {`${msg.senderFirstName?.[0] ?? ''}${msg.senderLastName?.[0] ?? ''}`.toUpperCase() || '?'}
                          </div>
                          <div className={`max-w-[70%] ${msg.senderId === user?.uid ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`flex items-center gap-2 mb-1 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                              <span className="font-bold text-sm text-charcoal">
                                {msg.senderId === user?.uid ? 'You' : `${msg.senderFirstName} ${msg.senderLastName}`}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.senderId === user?.uid ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <PollsSection eventId={eventId} />
                )}
              </div>

              {activeTab === 'messages' && (
                <form onSubmit={handlePostMessage} className="p-4 bg-slate-50/50 border-t border-gray-100 flex-shrink-0">
                  <div className="relative group">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={selectedConversation ? `Message #${selectedConversation.name}` : 'Select a channel...'}
                      disabled={!selectedConversation || sendingMessage}
                      className="w-full py-3.5 pl-5 pr-14 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !selectedConversation || sendingMessage}
                      className="absolute top-1/2 right-3 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Press Enter to send</p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollaborationHubSidebar;
