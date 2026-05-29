import Link from "next/link";
import { Camera, Clapperboard, Flower2, MapPin, Music, Utensils } from "lucide-react";

const categories = [
  { name: "Photographers", slug: "photographers", icon: Camera },
  { name: "Venues", slug: "venues", icon: MapPin, href: "/venues" },
  { name: "Caterers", slug: "caterers", icon: Utensils },
  { name: "Music", slug: "music", icon: Music },
  { name: "Florists", slug: "florists", icon: Flower2 },
  { name: "Videographers", slug: "videographers", icon: Clapperboard },
];

export default function BrowseByCategory() {
  return (
    <section className="marketing-section-alt py-20 md:py-24" id="directory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Vendor directory
          </p>
          <h2 className="mt-3 font-playfair text-3xl font-bold text-foreground md:text-4xl">
            Browse by category
          </h2>
          <p className="mt-4 text-muted-foreground">
            Planners shortlist from verified vendors — couples can explore the same curated network.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const href = category.href ?? `/vendors/search?category=${category.slug}`;
            return (
              <Link
                key={category.name}
                href={href}
                className="group flex flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={28} strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/vendors"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            View full vendor directory →
          </Link>
        </p>
      </div>
    </section>
  );
}
