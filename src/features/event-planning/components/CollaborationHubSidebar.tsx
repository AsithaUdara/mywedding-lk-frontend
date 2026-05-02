"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { getConversations, getMessages, postMessage, type Conversation, type Message } from '@/lib/api/collaboration';
import { useRealTime } from '@/context/RealTimeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Hash, Vote, MessageSquare, Loader2 } from 'lucide-react';
import PollsSection from './PollsSection';

const CollaborationHubSidebar = ({ eventId }: { eventId: string }) => {
  const { isHubOpen, closeHub } = useUI();
  const { user } = useAuth();
  const { lastMessage } = useRealTime();

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

  // Real-time message listener
  useEffect(() => {
    if (lastMessage && selectedConversation && lastMessage.conversationId === selectedConversation.id) {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(m => m.id === lastMessage.id)) return prev;
        return [...prev, lastMessage];
      });
    }
  }, [lastMessage, selectedConversation]);

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim() || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const token = await user.getIdToken();
      await postMessage(token, selectedConversation.id, messageContent);
      // We don't need to manually re-fetch messages anymore! 
      // The SignalR broadcast will add it to the list via the useEffect above.
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={closeHub} 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" 
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: '0%' }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 35 }} 
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white/95 backdrop-blur-xl z-[60] flex flex-col shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] border-l border-white/60"
          >
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-primary to-[#7a1b32] p-6 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-playfair tracking-wide">Team Hub</h2>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Real-time Collaboration</p>
                </div>
              </div>
              <button 
                onClick={closeHub} 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Glass Tab Switcher */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'messages' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab('polls')}
                  className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'polls' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Polls
                </button>
              </div>
              
              {activeTab === 'messages' && selectedConversation && (
                <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                  <Hash size={14} />
                  {selectedConversation.name}
                </div>
              )}
            </div>

            <div className="flex-grow flex min-h-0 overflow-hidden">
              {/* Channel List (Sidebar within drawer) */}
              {activeTab === 'messages' && (
                <div className="w-[200px] border-r border-gray-100 flex flex-col bg-gray-50/30">
                  <div className="p-4 pt-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Channels</h3>
                    <div className="space-y-1">
                      {loadingConversations ? (
                        <div className="py-4 text-center"><Loader2 size={16} className="animate-spin inline text-primary/30" /></div>
                      ) : (
                        conversations.map(convo => (
                          <button
                            key={convo.id}
                            onClick={() => setSelectedConversation(convo)}
                            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${selectedConversation?.id === convo.id ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white/50'}`}
                          >
                            <Hash size={14} className={selectedConversation?.id === convo.id ? 'text-primary' : 'text-gray-300'} />
                            <span className="truncate">{convo.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div className="flex-grow flex flex-col bg-white overflow-hidden">
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                  {activeTab === 'messages' ? (
                    <div className="space-y-6">
                      {loadingMessages ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                          <Loader2 size={24} className="animate-spin text-primary/40" />
                          <p className="text-sm text-gray-400">Loading messages...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                          <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center">
                            <MessageSquare size={32} className="text-primary/20" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 font-playfair text-lg">Empty Conversation</p>
                            <p className="text-sm text-gray-400">Start coordinating with your team members.</p>
                          </div>
                        </div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs shadow-sm border border-white">
                              {`${msg.senderFirstName?.[0] ?? ''}${msg.senderLastName?.[0] ?? ''}`.toUpperCase() || '?'}
                            </div>
                            <div className={`max-w-[80%] ${msg.senderId === user?.uid ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                              <div className={`flex items-center gap-2 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                                <span className="font-bold text-[11px] text-gray-900">
                                  {msg.senderId === user?.uid ? 'You' : `${msg.senderFirstName} ${msg.senderLastName}`}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold tracking-tight">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.senderId === user?.uid ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-50'}`}>
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
                  <form onSubmit={handlePostMessage} className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <div className="relative group">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedConversation ? `Message #${selectedConversation.name}...` : 'Select a channel'}
                        disabled={!selectedConversation || sendingMessage}
                        className="w-full py-4 pl-6 pr-14 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all text-sm placeholder:text-gray-400"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || !selectedConversation || sendingMessage}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                      >
                        {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollaborationHubSidebar;
