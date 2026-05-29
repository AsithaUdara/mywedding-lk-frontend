"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useAuth } from "@/shared/context/AuthContext";
import { ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  dropdownIconWrapClass,
  dropdownItemClass,
  dropdownPanelClass,
} from "./dropdown-styles";

function getInitials(displayName: string | null, email: string | null) {
  if (displayName) {
    const names = displayName.split(" ");
    if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return displayName.substring(0, 1).toUpperCase();
  }
  if (email) return email.substring(0, 1).toUpperCase();
  return "U";
}

export default function UserDropdown() {
  const { user, logOut } = useAuth();

  if (!user) return null;

  const initials = getInitials(user.displayName, user.email);

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={cn(
          "group inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2",
          "transition-colors duration-150",
          "hover:bg-muted/80",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "data-[open]:bg-muted"
        )}
      >
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-transparent transition-shadow group-data-[open]:ring-primary/25">
          {user.photoURL ? (
            <Image src={user.photoURL} alt="" fill className="object-cover" sizes="36px" />
          ) : (
            initials
          )}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180"
          aria-hidden
        />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        transition
        modal={false}
        className={cn(dropdownPanelClass, "w-64 [--anchor-gap:0.5rem]")}
      >
        <div className="border-b border-border px-3 py-3">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.displayName || "Account"}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div className="py-1">
          <MenuItem>
            <Link href="/dashboard" className={dropdownItemClass}>
              <span className={dropdownIconWrapClass}>
                <LayoutDashboard size={18} strokeWidth={2} aria-hidden />
              </span>
              Dashboard
            </Link>
          </MenuItem>
          <MenuItem>
            <Link href="/settings" className={dropdownItemClass}>
              <span className={dropdownIconWrapClass}>
                <Settings size={18} strokeWidth={2} aria-hidden />
              </span>
              Account settings
            </Link>
          </MenuItem>
        </div>

        <div className="border-t border-border pt-1">
          <MenuItem>
            <button
              type="button"
              onClick={() => logOut()}
              className={cn(
                dropdownItemClass,
                "text-destructive hover:bg-destructive/10 hover:text-destructive data-[focus]:bg-destructive/10"
              )}
            >
              <span
                className={cn(
                  dropdownIconWrapClass,
                  "bg-destructive/10 text-destructive group-hover:bg-destructive/15"
                )}
              >
                <LogOut size={18} strokeWidth={2} aria-hidden />
              </span>
              Log out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
