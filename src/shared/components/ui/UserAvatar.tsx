"use client";

import { cn } from "@/shared/lib/cn";
import {
  getAvatarPalette,
  getUserDisplayName,
  getUserInitials,
  type UserNameFields,
} from "@/shared/lib/userDisplay";

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
} as const;

export interface UserAvatarProps extends UserNameFields {
  seed?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  title?: string;
}

export function UserAvatar({
  firstName,
  lastName,
  email,
  seed,
  size = "md",
  className,
  title,
}: UserAvatarProps) {
  const palette = getAvatarPalette(seed ?? email);
  const initials = getUserInitials({ firstName, lastName, email });
  const displayName = title ?? getUserDisplayName({ firstName, lastName, email });

  return (
    <div
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white/70",
        SIZE_CLASSES[size],
        palette.bg,
        palette.text,
        palette.ring,
        className
      )}
      title={displayName}
      aria-label={displayName}
    >
      {initials}
    </div>
  );
}
