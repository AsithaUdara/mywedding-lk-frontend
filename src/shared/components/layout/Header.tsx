"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { Menu, Search, X } from "lucide-react";
import Logo from "@/assets/MyWedding.png";
import VendorsNavMenu from "./VendorsNavMenu";
import UserDropdown from "./UserDropdown";
import AuthModal from "@/modules/identity/AuthModal";
import { HeaderSearchField } from "./HeaderSearchField";
import { cn } from "@/shared/lib/cn";
import { navTriggerClass } from "./dropdown-styles";

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isSearchPage = pathname.startsWith("/vendors/search");
  const showSearchBar = isSearchPage || isSearchOpen;

  useEffect(() => {
    setIsSearchOpen(isSearchPage);
  }, [isSearchPage]);

  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    else setModalOpen(true);
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  const handleSearchToggle = () => {
    setIsSearchOpen(true);
    if (!isSearchPage) {
      router.push("/vendors/search");
    }
  };

  const iconButtonClass = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80",
    "transition-colors duration-150 hover:bg-muted hover:text-foreground",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/65 shadow-[0_4px_24px_hsl(220_25%_18%/0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/55">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:h-[4.5rem] lg:gap-6 lg:px-8">
          <Link
            href="/"
            className="relative block h-11 w-[150px] shrink-0 sm:h-12 sm:w-[170px] lg:h-[3.25rem] lg:w-[210px]"
            aria-label="MyWedding.lk home"
          >
            <Image
              src={Logo}
              alt="MyWedding.lk"
              fill
              sizes="(max-width: 640px) 150px, 210px"
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex"
            aria-label="Main"
          >
            <VendorsNavMenu />
            <Link href="/venues" className={navTriggerClass}>
              Venues
            </Link>
            <Link href="/vendors" className={navTriggerClass}>
              Inspiration
            </Link>
          </nav>

          {showSearchBar && (
            <div className="hidden min-w-0 flex-1 md:block md:max-w-sm lg:max-w-md xl:max-w-lg">
              <Suspense
                fallback={
                  <div className="h-10 w-full animate-pulse rounded-full bg-muted/40" aria-hidden />
                }
              >
                <HeaderSearchField autoFocus={isSearchOpen && !isSearchPage} />
              </Suspense>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={handleSearchToggle}
              className={cn(
                iconButtonClass,
                showSearchBar && isSearchPage && "bg-muted text-foreground"
              )}
              aria-label="Search vendors"
              aria-expanded={showSearchBar}
            >
              <Search size={20} strokeWidth={2} />
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
              className={cn(iconButtonClass, "lg:hidden")}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {showSearchBar && (
          <div className="border-t border-border/50 px-4 py-2.5 md:hidden">
            <Suspense
              fallback={
                <div className="h-10 w-full animate-pulse rounded-full bg-muted/40" aria-hidden />
              }
            >
              <HeaderSearchField autoFocus={isSearchOpen && !isSearchPage} />
            </Suspense>
          </div>
        )}

        {isMobileMenuOpen && (
          <nav
            className="border-t border-border bg-white px-4 py-3 lg:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-0.5">
              {[
                { href: "/vendors", label: "Vendors" },
                { href: "/venues", label: "Venues" },
                { href: "/vendors", label: "Inspiration" },
                { href: "/vendors/search", label: "Search vendors" },
                { href: "/planner/signup", label: "For planners", accent: true },
                { href: "/vendor/signup", label: "List your business", accent: true },
              ].map((item) => (
                <li key={item.label}>
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
