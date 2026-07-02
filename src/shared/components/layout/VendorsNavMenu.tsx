"use client";

import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Camera, ChevronDown, Flower2, Music, Utensils } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  dropdownIconWrapClass,
  dropdownItemClass,
  dropdownPanelClass,
  navTriggerClass,
} from "./dropdown-styles";

const vendorCategories = [
  { name: "Photographers", href: "/vendors/search?category=Photographers", icon: Camera },
  { name: "Music Bands", href: "/vendors/search?category=Music+Bands", icon: Music },
  { name: "Caterers", href: "/vendors/search?category=Caterers", icon: Utensils },
  { name: "Florists", href: "/vendors/search?category=Florists", icon: Flower2 },
];

export default function VendorsNavMenu() {
  return (
    <Menu as="div" className="relative">
      <MenuButton className={cn(navTriggerClass, "group")}>
        Vendors
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="opacity-60 transition-transform duration-200 group-data-[open]:rotate-180"
          aria-hidden
        />
      </MenuButton>

      <MenuItems
        anchor="bottom"
        transition
        modal={false}
        className={cn(dropdownPanelClass, "w-[min(100vw-2rem,18rem)] [--anchor-gap:0.5rem]")}
      >
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Browse by category
        </p>
        {vendorCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <MenuItem key={cat.name}>
              <Link href={cat.href} className={dropdownItemClass}>
                <span className={dropdownIconWrapClass}>
                  <Icon size={18} strokeWidth={2} aria-hidden />
                </span>
                {cat.name}
              </Link>
            </MenuItem>
          );
        })}
        <div className="mt-1 border-t border-border pt-1">
          <MenuItem>
            <Link
              href="/vendors"
              className={cn(
                dropdownItemClass,
                "justify-center font-semibold text-primary hover:bg-primary/5 hover:text-primary"
              )}
            >
              Browse all vendors
            </Link>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
