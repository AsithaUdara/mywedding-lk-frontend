"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUI } from "@/shared/context/UIContext";
import { useAuth } from "@/shared/context/AuthContext";
import { postMessage, type Message } from "@/shared/lib/api/collaboration";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { X, Send, Hash, MessageSquare, Loader2, Users } from "lucide-react";
import { useTeamHub } from "@/shared/hooks/useTeamHub";
import { Skeleton } from "@/shared/components/ui";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { AvatarStack } from "@/shared/components/ui/AvatarStack";
import { getUserDisplayName } from "@/shared/lib/userDisplay";
import { cn } from "@/shared/lib/cn";

function formatMessageTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupMessagesByDay(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];

  for (const message of messages) {
    const label = formatDayLabel(message.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.label === label) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ label, messages: [message] });
    }
  }

  return groups;
}

function MessageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading messages">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-full max-w-md rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

const CollaborationHubSidebar = ({ eventId }: { eventId: string }) => {
  const { isHubOpen, closeHub } = useUI();
  const { user } = useAuth();
  const { lastMessage, isConnected } = useRealTime();

  const {
    conversations,
    organizers,
    selectedConversation,
    messages,
    loadingConversations,
    loadingMessages,
    error,
    selectConversation,
    setMessagesForConversation,
  } = useTeamHub(eventId);

  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(0);

  const messageGroups = useMemo(() => groupMessagesByDay(messages), [messages]);

  const isViewer = useMemo(() => {
    if (!user) return false;
    return organizers.find((o) => o.userId === user.uid)?.permissionLevel === "Viewer";
  }, [organizers, user]);

  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHubOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isHubOpen]);

  useEffect(() => {
    if (!isHubOpen) return;

    const grew = messages.length > previousCountRef.current;
    previousCountRef.current = messages.length;

    if (grew) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isHubOpen]);

  useEffect(() => {
    if (isHubOpen && messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [isHubOpen, selectedConversation?.id]);

  useEffect(() => {
    if (!lastMessage || !selectedConversation) return;
    if (lastMessage.conversationId !== selectedConversation.id) return;

    setMessagesForConversation(selectedConversation.id, (prev) => {
      if (prev.some((message) => message.id === lastMessage.id)) return prev;

      const withoutOptimistic =
        lastMessage.senderId === user?.uid
          ? prev.filter(
              (message) =>
                !(message.id.startsWith("temp-") && message.content === lastMessage.content)
            )
          : prev;

      return [...withoutOptimistic, lastMessage];
    });
  }, [lastMessage, selectedConversation, setMessagesForConversation, user?.uid]);

  const handlePostMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim() || sendingMessage || isViewer) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: selectedConversation.id,
      content: messageContent,
      createdAt: new Date().toISOString(),
      senderId: user.uid,
      senderFirstName: user.displayName?.split(" ")[0] ?? "You",
      senderLastName: user.displayName?.split(" ").slice(1).join(" ") ?? "",
      attachment: null,
    };

    setNewMessage("");
    setSendingMessage(true);
    setSendError(null);
    setMessagesForConversation(selectedConversation.id, (prev) => [...prev, optimisticMessage]);

    try {
      const token = await user.getIdToken();
      await postMessage(token, selectedConversation.id, messageContent);
    } catch (err) {
      console.error("Failed to send message:", err);
      setSendError(err instanceof Error ? err.message : "Could not send message.");
      setNewMessage(messageContent);
      setMessagesForConversation(selectedConversation.id, (prev) =>
        prev.filter((message) => message.id !== tempId)
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handlePostMessage(event as unknown as React.FormEvent);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/35 transition-opacity duration-200",
          isHubOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeHub}
        aria-hidden={!isHubOpen}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 z-[120] flex h-full w-full flex-col border-l border-border/60 bg-background shadow-2xl transition-transform duration-200 ease-out md:max-w-3xl",
          isHubOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
        aria-hidden={!isHubOpen}
        aria-label="Team Hub"
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border/60 bg-primary px-5 py-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <MessageSquare size={20} aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Team Hub</h2>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-primary-foreground/75">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    isConnected ? "bg-emerald-300" : "bg-amber-300"
                  )}
                  aria-hidden
                />
                {isConnected ? "Live" : "Connecting"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={closeHub}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Close team hub"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <nav className="flex w-[168px] flex-shrink-0 flex-col border-r border-border/60 bg-muted/20">
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Channels
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingConversations ? (
                <div className="space-y-2 px-1 py-2">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => {
                    const active = selectedConversation?.id === conversation.id;
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => void selectConversation(conversation)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          active
                            ? "bg-background text-primary shadow-sm ring-1 ring-border/70"
                            : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                        )}
                      >
                        <Hash size={14} className={active ? "text-primary" : "text-muted-foreground"} />
                        <span className="truncate">{conversation.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-border/60 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Users size={12} />
                Team
              </div>
              {organizers.length > 0 ? (
                <>
                  <AvatarStack
                    members={organizers.map((member) => ({
                      userId: member.userId,
                      firstName: member.firstName,
                      lastName: member.lastName,
                      email: member.email,
                    }))}
                    max={4}
                    className="mb-2"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {organizers.length} member{organizers.length === 1 ? "" : "s"}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground">No members loaded</p>
              )}
            </div>
          </nav>

          <section className="flex min-w-0 flex-1 flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedConversation?.name ?? "Select a channel"}
                </h3>
              </div>
              {selectedConversation && (
                <span className="text-xs text-muted-foreground">
                  {messages.length} message{messages.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {error && (
                <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {loadingMessages ? (
                <MessageSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <MessageSquare size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {selectedConversation ? `#${selectedConversation.name} is ready` : "Pick a channel"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Share updates, decisions, and planning notes with your team.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messageGroups.map((group) => (
                    <div key={group.label}>
                      <div className="relative mb-4 flex items-center">
                        <div className="h-px flex-1 bg-border/70" />
                        <span className="mx-3 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {group.label}
                        </span>
                        <div className="h-px flex-1 bg-border/70" />
                      </div>

                      <div className="space-y-4">
                        {group.messages.map((message) => {
                          const isSelf = message.senderId === user?.uid;
                          const senderLabel = isSelf
                            ? "You"
                            : getUserDisplayName({
                                firstName: message.senderFirstName,
                                lastName: message.senderLastName,
                                email: "",
                              });

                          return (
                            <article key={message.id} className="flex items-start gap-3">
                              <UserAvatar
                                firstName={message.senderFirstName}
                                lastName={message.senderLastName}
                                email={message.senderId}
                                seed={message.senderId}
                                size="sm"
                                className="mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                  <span className="text-sm font-semibold text-foreground">
                                    {senderLabel}
                                  </span>
                                  <time
                                    className="text-[11px] text-muted-foreground"
                                    dateTime={message.createdAt}
                                  >
                                    {formatMessageTime(message.createdAt)}
                                  </time>
                                </div>
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                                  {message.content}
                                </p>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form
              onSubmit={handlePostMessage}
              className="border-t border-border/60 bg-muted/10 p-4"
            >
              {isViewer ? (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
                  Viewers can read messages but cannot post in Team Hub.
                </div>
              ) : (
              <div className="rounded-2xl border border-border/70 bg-background p-2 shadow-sm">
                {sendError && (
                  <p className="px-3 pt-2 text-xs font-medium text-destructive">{sendError}</p>
                )}
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedConversation
                      ? `Message #${selectedConversation.name}`
                      : "Select a channel to start chatting"
                  }
                  disabled={!selectedConversation || sendingMessage}
                  rows={2}
                  className="max-h-32 min-h-[52px] w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="text-[11px] text-muted-foreground">
                    Enter to send · Shift+Enter for new line
                  </span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !selectedConversation || sendingMessage}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                    aria-label="Send message"
                  >
                    {sendingMessage ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
              )}
            </form>
          </section>
        </div>
      </aside>
    </>
  );
};

export default CollaborationHubSidebar;
