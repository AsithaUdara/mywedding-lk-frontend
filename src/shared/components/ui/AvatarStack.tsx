"use client";

import { cn } from "@/shared/lib/cn";
import { getUserDisplayName } from "@/shared/lib/userDisplay";
import { UserAvatar, type UserAvatarProps } from "./UserAvatar";

export interface AvatarStackMember extends UserAvatarProps {
  userId: string;
}

interface AvatarStackProps {
  members: AvatarStackMember[];
  max?: number;
  size?: UserAvatarProps["size"];
  className?: string;
}

export function AvatarStack({ members, max = 3, size = "sm", className }: AvatarStackProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2.5 overflow-hidden p-0.5">
        {visible.map((member) => (
          <UserAvatar
            key={member.userId}
            firstName={member.firstName}
            lastName={member.lastName}
            email={member.email}
            seed={member.userId}
            size={size}
            className="border border-white/60"
          />
        ))}
        {overflow > 0 && (
          <div
            className={cn(
              "inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/50 text-[10px] font-bold text-muted-foreground ring-2 ring-white/70",
              size === "md" && "h-10 w-10 text-xs"
            )}
            title={members
              .slice(max)
              .map((member) => getUserDisplayName(member))
              .join(", ")}
            aria-label={`${overflow} more team members`}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}
