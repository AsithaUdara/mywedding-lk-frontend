"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { useUI } from "@/shared/context/UIContext";
import { useNotifications } from "@/shared/context/NotificationContext";
import { mapMessage } from "@/shared/lib/api/collaboration";
import { getOrganizers, type Organizer } from "@/shared/lib/api/events";
import { resolveMessageSender, truncateMessagePreview } from "@/shared/lib/messageDisplay";

type TeamHubNotificationsContextType = {
  unreadCount: number;
  preview: { sender: string; content: string } | null;
  activeConversationId: string | null;
  setActiveConversationId: (conversationId: string | null) => void;
  getConversationUnread: (conversationId: string) => number;
  markConversationRead: (conversationId: string) => void;
  clearUnread: () => void;
};

const TeamHubNotificationsContext = createContext<TeamHubNotificationsContextType>({
  unreadCount: 0,
  preview: null,
  activeConversationId: null,
  setActiveConversationId: () => {},
  getConversationUnread: () => 0,
  markConversationRead: () => {},
  clearUnread: () => {},
});

export function useTeamHubNotifications() {
  return useContext(TeamHubNotificationsContext);
}

export function TeamHubNotificationsProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { lastMessage, messageVersion } = useRealTime();
  const { isHubOpen, openHub } = useUI();
  const { notify } = useNotifications();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});
  const [preview, setPreview] = useState<{ sender: string; content: string } | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const notifiedMessageIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = useMemo(
    () => Object.values(unreadByConversation).reduce((sum, count) => sum + count, 0),
    [unreadByConversation]
  );

  const isViewingConversation = useCallback(
    (conversationId: string) => isHubOpen && activeConversationId === conversationId,
    [isHubOpen, activeConversationId]
  );

  const getConversationUnread = useCallback(
    (conversationId: string) => unreadByConversation[conversationId] ?? 0,
    [unreadByConversation]
  );

  const markConversationRead = useCallback((conversationId: string) => {
    setUnreadByConversation((prev) => {
      if (!prev[conversationId]) return prev;
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadByConversation({});
    setPreview(null);
  }, []);

  useEffect(() => {
    if (!user || !eventId) return;

    let cancelled = false;

    void (async () => {
      try {
        const token = await user.getIdToken();
        const data = await getOrganizers(token, eventId);
        if (!cancelled) setOrganizers(data);
      } catch {
        if (!cancelled) setOrganizers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, eventId]);

  useEffect(() => {
    if (!lastMessage || !user) return;

    const message = mapMessage(lastMessage as unknown as Record<string, unknown>);
    if (!message.id || !message.conversationId) return;
    if (message.senderId === user.uid) return;
    if (notifiedMessageIdsRef.current.has(message.id)) return;

    notifiedMessageIdsRef.current.add(message.id);

    if (isViewingConversation(message.conversationId)) {
      return;
    }

    const sender = resolveMessageSender(message, organizers, user.uid);
    const snippet = truncateMessagePreview(message.content);

    setUnreadByConversation((prev) => ({
      ...prev,
      [message.conversationId]: (prev[message.conversationId] ?? 0) + 1,
    }));
    setPreview({ sender: sender.label, content: snippet });

    notify("New team message", `${sender.label}: ${snippet}`, {
      action: {
        label: "Open team hub",
        onClick: openHub,
      },
    });
  }, [lastMessage, messageVersion, user, organizers, isViewingConversation, notify, openHub]);

  useEffect(() => {
    if (unreadCount === 0) {
      setPreview(null);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (isHubOpen && activeConversationId) {
      markConversationRead(activeConversationId);
    }
  }, [isHubOpen, activeConversationId, markConversationRead]);

  return (
    <TeamHubNotificationsContext.Provider
      value={{
        unreadCount,
        preview,
        activeConversationId,
        setActiveConversationId,
        getConversationUnread,
        markConversationRead,
        clearUnread,
      }}
    >
      {children}
    </TeamHubNotificationsContext.Provider>
  );
}
