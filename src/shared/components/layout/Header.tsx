"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/shared/context/AuthContext";
import { Heart, Search, Menu, X } from "lucide-react";
import Logo from "@/assets/MyWedding.png";
import VendorsNavMenu from "./VendorsNavMenu";
import UserDropdown from "./UserDropdown";
import AuthModal from "@/modules/identity/AuthModal";
import { cn } from "@/shared/lib/cn";
import { navTriggerClass } from "./dropdown-styles";

interface HeaderProps {
  onLoginClick?: () => void;
}

const iconButtonClass = cn(
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80",
  "transition-colors duration-150 hover:bg-muted hover:text-foreground",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
);

export default function Header({ onLoginClick }: HeaderProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    else setModalOpen(true);
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
          <Link
            href="/"
            className="relative block h-11 w-[170px] shrink-0 sm:h-12 sm:w-[190px] lg:h-[3.25rem] lg:w-[210px]"
            aria-label="MyWedding.lk home"
          >
            <Image
              src={Logo}
              alt="MyWedding.lk"
              fill
              sizes="(max-width: 640px) 170px, 210px"
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-1 md:flex"
            aria-label="Main"
          >
            <VendorsNavMenu />
            <Link href="/venues" className={navTriggerClass}>
              Venues
            </Link>
            <Link href="/planner/signup" className={navTriggerClass}>
              For planners
            </Link>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link href="/vendors/search" className={cn(iconButtonClass, "hidden sm:inline-flex")} aria-label="Search vendors">
              <Search size={20} strokeWidth={2} />
            </Link>
            <button type="button" className={cn(iconButtonClass, "hidden sm:inline-flex")} aria-label="Saved vendors">
              <Heart size={20} strokeWidth={2} />
            </button>

            <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden />

            {user ? (
              <UserDropdown />
            ) : (
              <button
                type="button"
                onClick={handleLoginClick}
                className="ml-1 hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition-opacity duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
              >
                Log in
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(iconButtonClass, "md:hidden")}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            className="border-t border-border bg-white px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-0.5">
              {[
                { href: "/vendors", label: "Vendors" },
                { href: "/venues", label: "Venues" },
                { href: "/planner/signup", label: "For planners" },
                { href: "/vendors/search", label: "Search vendors" },
                { href: "/vendor/signup", label: "List your business", accent: true },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "block rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      item.accent
                        ? "text-primary hover:bg-primary/5"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!user && (
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      handleLoginClick();
                    }}
                    className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Log in
                  </button>
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>

      {!user && !onLoginClick && (
        <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
