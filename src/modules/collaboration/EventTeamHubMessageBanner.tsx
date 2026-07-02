"use client";

import { MessageSquare } from "lucide-react";
import { useTeamHubNotifications } from "@/shared/context/TeamHubNotificationsContext";
import { useUI } from "@/shared/context/UIContext";
import { cn } from "@/shared/lib/cn";

type Props = {
  className?: string;
};

export function EventTeamHubMessageBanner({ className }: Props) {
  const { unreadCount, preview } = useTeamHubNotifications();
  const { openHub, isHubOpen } = useUI();

  if (isHubOpen || unreadCount === 0 || !preview) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-sky-950 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <MessageSquare size={18} className="mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold">
            {unreadCount === 1 ? "New team message" : `${unreadCount} new team messages`}
          </p>
          <p className="mt-0.5 text-sm text-sky-900/90">
            <span className="font-medium">{preview.sender}</span>: {preview.content}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={openHub}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open team hub
      </button>
    </div>
  );
}
