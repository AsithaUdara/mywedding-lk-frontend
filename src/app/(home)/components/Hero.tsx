import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Reliable Unsplash IDs — middle image uses a distinct, high-contrast wedding photo */
const pillars = [
  {
    num: "01",
    date: "Step one",
    title: "ONBOARD CLIENTS",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Wedding couple portrait",
  },
  {
    num: "02",
    date: "Step two",
    title: "SHORTLIST VENDORS",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Wedding reception table setting",
  },
  {
    num: "03",
    date: "Step three",
    title: "GET PAID",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Outdoor wedding celebration",
  },
];

function HeroColumn({
  num,
  date,
  title,
  image,
  alt,
}: (typeof pillars)[number]) {
  return (
    <article className="hero-arch-column flex flex-col items-center text-center">
      <div className="hero-arch-wrap w-full max-w-[220px] sm:max-w-none">
        <div className="hero-arch-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className="hero-arch-img" loading={num === "01" ? "eager" : "lazy"} />
          <span className="hero-arch-num" aria-hidden>
            {num}.
          </span>
        </div>
      </div>
      <div className="hero-editorial-stem" aria-hidden />
      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{date}</p>
      <h3 className="mt-1 font-playfair text-sm font-semibold uppercase tracking-[0.12em] text-foreground sm:text-base">
        {title}
      </h3>
    </article>
  );
}

export default function Hero() {
  return (
    <section className="marketing-hero relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pb-20 lg:pt-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          <div className="flex flex-col justify-between lg:col-span-4 lg:min-h-[500px]">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                B2B · Sri Lanka
              </p>
              <h1 className="hero-editorial-title mt-6 font-playfair text-[2.75rem] font-normal leading-[0.95] text-foreground sm:text-6xl">
                <span className="block">Scale</span>
                <span className="block">your</span>
                <span className="block text-primary">agency.</span>
              </h1>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground lg:text-base">
                One workspace for clients, vendor shortlists, timelines, contracts, and payments — built for
                professional planners.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-8 lg:mt-0">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/planner/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-md shadow-primary/15 transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Planner workspace
                  <ArrowRight size={14} aria-hidden />
                </Link>
                <Link
                  href="/vendor/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm transition-colors duration-200 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  List your business
                </Link>
              </div>

              <div className="hero-invite-stamp bg-white/80" aria-hidden>
                <svg viewBox="0 0 100 100" className="h-full w-full p-3">
                  <defs>
                    <path id="inviteCircle" d="M 50,50 m -32,0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0" />
                  </defs>
                  <text className="fill-primary text-[8px] font-semibold uppercase tracking-[0.35em]">
                    <textPath href="#inviteCircle" startOffset="0%">
                      You are invited · MyWedding.lk ·
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:col-span-8 lg:gap-6">
            {pillars.map((pillar) => (
              <HeroColumn key={pillar.num} {...pillar} />
            ))}
          </div>
        </div>

        <p className="mt-12 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground lg:text-left">
          Couples exploring vendors?{" "}
          <Link href="/vendors" className="font-semibold text-primary underline-offset-4 hover:underline">
            Browse the directory →
          </Link>
        </p>
      </div>
    </section>
  );
}
