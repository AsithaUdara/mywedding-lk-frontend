import React from "react";
import { type ActivityFeedItem } from "@/shared/lib/api/feed";
import { MessageSquare, CheckCircle, UserPlus, Wallet } from "lucide-react";

const ActivityItem = ({ item }: { item: ActivityFeedItem }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
  };

  const renderIcon = () => {
    if (item.itemType === "UserComment") {
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
          {getInitials(item.userFirstName, item.userLastName)}
        </div>
      );
    }
    if (item.content.includes("completed")) {
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="text-success" size={18} aria-hidden />
        </div>
      );
    }
    if (item.content.includes("invited")) {
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/15">
          <UserPlus className="text-accent" size={18} aria-hidden />
        </div>
      );
    }
    if (item.content.includes("expense")) {
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="text-primary" size={18} aria-hidden />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="text-muted-foreground" size={18} aria-hidden />
      </div>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  return (
    <div className="group flex items-start gap-4">
      <div className="relative">
        {renderIcon()}
        <div className="absolute left-1/2 top-10 -ml-px h-full w-0.5 bg-white/50 group-last:hidden" />
      </div>
      <div className="flex-grow pb-4 pt-1">
        <p className="text-sm leading-snug text-foreground">
          <span className="font-bold">
            {item.userFirstName} {item.userLastName}
          </span>
          {item.itemType === "SystemLog" ? (
            <span className="text-muted-foreground"> {item.content}</span>
          ) : (
            <span className="text-muted-foreground">: {item.content}</span>
          )}
        </p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {formatTimeAgo(item.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;
