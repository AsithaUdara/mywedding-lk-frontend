"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getConversations,
  getMessages,
  type Conversation,
  type Message,
} from "@/shared/lib/api/collaboration";
import { getOrganizers, type Organizer } from "@/shared/lib/api/events";

interface TeamHubState {
  conversations: Conversation[];
  organizers: Organizer[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  error: string | null;
  selectConversation: (conversation: Conversation) => Promise<void>;
  refreshConversations: () => Promise<void>;
  setMessagesForConversation: (conversationId: string, updater: (prev: Message[]) => Message[]) => void;
}

export function useTeamHub(eventId: string, enabled = true): TeamHubState {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesCache = useRef<Map<string, Message[]>>(new Map());
  const prefetchKey = useRef<string | null>(null);
  const loadingMessagesFor = useRef<string | null>(null);

  const loadMessages = useCallback(async (conversation: Conversation, token: string) => {
    const cached = messagesCache.current.get(conversation.id);
    if (cached) {
      setMessages(cached);
      setLoadingMessages(false);
      return;
    }

    if (loadingMessagesFor.current === conversation.id) return;
    loadingMessagesFor.current = conversation.id;
    setLoadingMessages(true);

    try {
      const data = await getMessages(token, conversation.id);
      messagesCache.current.set(conversation.id, data);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Could not load messages for this channel.");
    } finally {
      loadingMessagesFor.current = null;
      setLoadingMessages(false);
    }
  }, []);

  const prefetchHubData = useCallback(async () => {
    if (!user || !enabled) return;

    setLoadingConversations(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const [conversationData, organizerData] = await Promise.all([
        getConversations(token, eventId),
        getOrganizers(token, eventId).catch(() => [] as Organizer[]),
      ]);

      setConversations(conversationData);
      setOrganizers(organizerData);

      const defaultConversation = conversationData[0] ?? null;
      if (defaultConversation) {
        setSelectedConversation((current) => current ?? defaultConversation);
        await loadMessages(defaultConversation, token);
      }
    } catch (err) {
      console.error("Failed to prefetch team hub:", err);
      setError("Could not load team hub channels.");
    } finally {
      setLoadingConversations(false);
    }
  }, [user, eventId, enabled, loadMessages]);

  useEffect(() => {
    const key = `${eventId}:${user?.uid ?? "guest"}`;
    if (!user || !enabled || prefetchKey.current === key) return;

    prefetchKey.current = key;
    messagesCache.current.clear();
    setConversations([]);
    setOrganizers([]);
    setSelectedConversation(null);
    setMessages([]);
    void prefetchHubData();
  }, [user, eventId, enabled, prefetchHubData]);

  const selectConversation = useCallback(
    async (conversation: Conversation) => {
      if (selectedConversation?.id === conversation.id) return;

      setSelectedConversation(conversation);
      setError(null);

      const cached = messagesCache.current.get(conversation.id);
      if (cached) {
        setMessages(cached);
        setLoadingMessages(false);
        return;
      }

      if (!user) return;
      const token = await user.getIdToken();
      await loadMessages(conversation, token);
    },
    [loadMessages, selectedConversation?.id, user]
  );

  const refreshConversations = useCallback(async () => {
    prefetchKey.current = null;
    await prefetchHubData();
  }, [prefetchHubData]);

  const setMessagesForConversation = useCallback(
    (conversationId: string, updater: (prev: Message[]) => Message[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        messagesCache.current.set(conversationId, next);
        return next;
      });
    },
    []
  );

  return {
    conversations,
    organizers,
    selectedConversation,
    messages,
    loadingConversations,
    loadingMessages,
    error,
    selectConversation,
    refreshConversations,
    setMessagesForConversation,
  };
}
