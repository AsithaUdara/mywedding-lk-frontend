// src/components/Hero.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const heroImageUrl = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';

const Hero = () => {
  return (
    <section className="relative flex h-[640px] items-start justify-center overflow-hidden text-white" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImageUrl}
          alt="Luxury wedding planning workspace"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="absolute inset-0 z-5 magical-particles" />
      <div className="absolute bottom-[-1px] left-0 z-20 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
          <path
            fill="var(--color-cream)"
            d="M0,100L1440,100L1440,20C1200,40 960,60 720,60C480,60 240,40 0,20Z"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl px-4 pt-32 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
          B2B wedding planning SaaS · Sri Lanka
        </p>
        <h1 className="wedding-title-animation pb-4 pt-4 text-5xl font-bold md:text-7xl">
          Scale your planning agency.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          MyWedding.lk gives professional planners a unified workspace for clients, vendors, timelines,
          contracts, and payments — while couples inquire through your curated directory.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/planner/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-charcoal shadow-lg transition hover:scale-[1.02]"
          >
            Start planner workspace
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Browse vendor directory
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
