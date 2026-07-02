"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Gold bridal rings on pink rose bouquet — Unsplash M2T1j-6Fn8w */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1920&q=80";
const HERO_IMAGE_LOCAL = "/images/hero-bouquet-rings.jpg";

export default function ConsumerHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [bgUrl, setBgUrl] = useState(HERO_IMAGE);

  const navigateToSearch = (value: string) => {
    const q = value.trim();
    router.push(q ? `/vendors/search?q=${encodeURIComponent(q)}` : "/vendors/search");
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  return (
    <section className="marketing-hero consumer-hero relative flex min-h-[min(88vh,680px)] items-center justify-center overflow-hidden sm:min-h-[560px] lg:min-h-[620px]">
      <div className="consumer-hero-bg absolute inset-0 z-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
          onError={() => setBgUrl(HERO_IMAGE_LOCAL)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/55" />
      </div>

      <div className="magical-particles pointer-events-none absolute inset-0 z-[1] opacity-40" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h1 className="consumer-hero-title">
          <span className="hero-line block">
            <span className="wedding-title-animation">Your Dream </span>
            <span className="left-to-right-gold-animation">Wedding,</span>
          </span>
          <span className="simplified-enhanced mt-1 block">
            Simplified.
          </span>
        </h1>

        <p className="animate-subtitle-appear mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
          Discover the best vendors, venues, and inspiration for your perfect day in Sri Lanka.
        </p>

        <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
          <form
            onSubmit={handleSearch}
            className="search-bar-always-visible search-bar-enhanced mx-auto flex items-center gap-2 rounded-full p-1.5 pl-5 sm:pl-6"
            role="search"
          >
            <label className="sr-only" htmlFor="home-hero-search">
              Search vendors and venues
            </label>
            <input
              id="home-hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for photographers, venues, caterers…"
              className="relative z-[2] min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
            />
            <button
              type="submit"
              className="sword-button-enhanced relative z-[3] flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-foreground sm:h-12 sm:w-12"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={2.25} aria-hidden />
            </button>
          </form>
        </div>
      </div>

      <div className="consumer-hero-curve pointer-events-none absolute bottom-0 left-0 right-0 z-[5]" aria-hidden>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="block h-14 w-full sm:h-16 md:h-[4.5rem]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,8 Q720,72 1440,8 L1440,80 L0,80 Z" fill="#EEF0F4" />
        </svg>
      </div>
    </section>
  );
}
