"use client";

import React from "react";
import { Organizer } from "@/shared/lib/api/events";
import { Eye, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { inputClass } from "@/shared/components/ui";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { getUserDisplayName } from "@/shared/lib/userDisplay";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface TeamMemberCardProps {
  organizer: Organizer;
  isOwner: boolean;
  isUpdating: boolean;
  onUpdateRole: (userId: string, targetType: "role" | "permissionLevel", newValue: string) => void;
}

const TeamMemberCard = ({ organizer, isOwner, isUpdating, onUpdateRole }: TeamMemberCardProps) => {
  const displayName = getUserDisplayName(organizer);

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
    <div className="group flex items-center gap-4 rounded-xl border border-white/55 bg-white/40 p-3.5 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_16px_hsl(345_100%_25%/0.06)]">
      <UserAvatar
        firstName={organizer.firstName}
        lastName={organizer.lastName}
        email={organizer.email}
        seed={organizer.userId}
        size="md"
      />
      <div className="min-w-0 flex-grow">
        <p className="flex items-center gap-2 truncate text-sm font-bold text-foreground">
          {displayName}
          {organizer.role === "Owner" && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent ring-1 ring-accent/15">
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
              glassInput,
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
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/50 ring-1 ring-white/60"
          title={displayPermission(organizer.permissionLevel)}
        >
          <PermissionIcon />
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
