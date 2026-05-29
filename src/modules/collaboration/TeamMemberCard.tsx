"use client";

import React from "react";
import { Organizer } from "@/shared/lib/api/events";
import { Eye, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { inputClass } from "@/shared/components/ui";

interface TeamMemberCardProps {
  organizer: Organizer;
  isOwner: boolean;
  isUpdating: boolean;
  onUpdateRole: (userId: string, targetType: "role" | "permissionLevel", newValue: string) => void;
}

const TeamMemberCard = ({ organizer, isOwner, isUpdating, onUpdateRole }: TeamMemberCardProps) => {
  const displayPermission = (level: string) => {
    switch (level) {
      case "Owner":
        return "Owner";
      case "Editor":
        return "Editor";
      case "Viewer":
        return "Viewer";
      default:
        return level;
    }
  };

  const PermissionIcon = () => {
    switch (organizer.permissionLevel) {
      case "Editor":
        return <ChevronDown size={14} className="text-primary" aria-hidden />;
      case "Viewer":
        return <Eye size={14} className="text-muted-foreground" aria-hidden />;
      default:
        return null;
    }
  };

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {organizer.firstName[0]}
        {organizer.lastName[0]}
      </div>
      <div className="min-w-0 flex-grow">
        <p className="flex items-center gap-2 truncate text-sm font-bold text-foreground">
          {organizer.firstName} {organizer.lastName}
          {organizer.role === "Owner" && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              Owner
            </span>
          )}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{organizer.email}</p>
      </div>

      {isOwner && organizer.role !== "Owner" ? (
        <div className="relative flex-shrink-0">
          <select
            value={organizer.permissionLevel}
            disabled={isUpdating}
            onChange={(e) => onUpdateRole(organizer.userId, "permissionLevel", e.target.value)}
            className={cn(
              inputClass,
              "appearance-none py-1.5 pl-3 pr-8 text-[11px] font-bold uppercase tracking-wider"
            )}
          >
            <option value="Viewer">Viewer</option>
            <option value="Editor">Editor</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
      ) : (
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted"
          title={displayPermission(organizer.permissionLevel)}
        >
          <PermissionIcon />
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
