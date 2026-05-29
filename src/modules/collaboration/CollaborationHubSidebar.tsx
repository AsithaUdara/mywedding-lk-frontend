"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUI } from '@/shared/context/UIContext';
import { useAuth } from '@/shared/context/AuthContext';
import { getConversations, getMessages, postMessage, type Conversation, type Message } from '@/shared/lib/api/collaboration';
import { useRealTime } from '@/shared/context/RealTimeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Hash, MessageSquare, Loader2 } from 'lucide-react';

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
  const [, setError] = useState<string | null>(null);

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
    if (selectedConversation) {
      fetchMessages();
    }
  }, [user, selectedConversation]);

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
            className="fixed top-0 right-0 z-[120] flex h-full w-full flex-col border-l border-border bg-card/95 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl md:max-w-2xl"
          >
            {/* Premium Header */}
            <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-primary to-primary/85 p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-playfair tracking-wide">Team Hub</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">
                    Real-time collaboration
                  </p>
                </div>
              </div>
              <button 
                onClick={closeHub} 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-end border-b border-border bg-muted/30 px-6 py-4">
              {selectedConversation && (
                <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                  <Hash size={14} />
                  {selectedConversation.name}
                </div>
              )}
            </div>

            <div className="flex-grow flex min-h-0 overflow-hidden">
              {/* Channel List (Sidebar within drawer) */}
              <div className="flex w-[200px] flex-col border-r border-border bg-muted/30">
                <div className="p-4 pt-6">
                  <h3 className="mb-4 ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Channels
                  </h3>
                  <div className="space-y-1">
                    {loadingConversations ? (
                      <div className="py-4 text-center"><Loader2 size={16} className="animate-spin inline text-primary/30" /></div>
                    ) : (
                      conversations.map(convo => (
                        <button
                          key={convo.id}
                          onClick={() => setSelectedConversation(convo)}
                          className={`flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${selectedConversation?.id === convo.id ? "border border-border bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/50"}`}
                        >
                          <Hash
                            size={14}
                            className={
                              selectedConversation?.id === convo.id
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          />
                          <span className="truncate">{convo.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex flex-grow flex-col overflow-hidden bg-card">
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                      {loadingMessages ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                          <Loader2 size={24} className="animate-spin text-primary/40" />
                          <p className="text-sm text-muted-foreground">Loading messages...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                          <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center">
                            <MessageSquare size={32} className="text-primary/20" />
                          </div>
                          <div>
                            <p className="font-playfair text-lg font-bold text-foreground">
                              Empty conversation
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Start coordinating with your team members.
                            </p>
                          </div>
                        </div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted text-xs font-bold text-muted-foreground shadow-sm">
                              {`${msg.senderFirstName?.[0] ?? ''}${msg.senderLastName?.[0] ?? ''}`.toUpperCase() || '?'}
                            </div>
                            <div className={`max-w-[80%] ${msg.senderId === user?.uid ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                              <div className={`flex items-center gap-2 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[11px] font-bold text-foreground">
                                  {msg.senderId === user?.uid ? 'You' : `${msg.senderFirstName} ${msg.senderLastName}`}
                                </span>
                                <span className="text-[9px] font-bold tracking-tight text-muted-foreground">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.senderId === user?.uid ? "rounded-tr-none bg-primary text-primary-foreground" : "rounded-tl-none border border-border bg-muted text-foreground"}`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                </div>

                <form
                  onSubmit={handlePostMessage}
                  className="border-t border-border bg-card p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]"
                >
                  <div className="relative group">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={selectedConversation ? `Message #${selectedConversation.name}...` : 'Select a channel'}
                      disabled={!selectedConversation || sendingMessage}
                      className="w-full rounded-2xl border border-border bg-muted/30 py-4 pl-6 pr-14 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-primary/10"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !selectedConversation || sendingMessage}
                      className="absolute right-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                    >
                      {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollaborationHubSidebar;

