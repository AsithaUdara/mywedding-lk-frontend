import Link from "next/link";
import { Camera, Clapperboard, Flower2, MapPin, Music, Utensils } from "lucide-react";
import { MkSection, MkSectionHeader } from "@/modules/marketing/marketing-glass-ui";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

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
    <MkSection id="directory" alt>
      <MkSectionHeader
        eyebrow="Vendor directory"
        title="Browse by category"
        subtitle="Planners shortlist from verified vendors — couples can explore the same curated network."
      />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
        {categories.map((category) => {
          const Icon = category.icon;
          const href = category.href ?? `/vendors/search?category=${category.slug}`;
          return (
            <Link
              key={category.name}
              href={href}
              className={cn(
                mk.glass,
                "group flex flex-col items-center rounded-2xl p-5 text-center transition-all duration-200 hover:border-[hsl(42_48%_52%/0.3)] hover:shadow-[0_6px_24px_hsl(345_100%_25%/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={26} strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-glass-body mt-4 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                {category.name}
              </h3>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-center">
        <Link
          href="/vendors"
          className="font-glass-body text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View full vendor directory →
        </Link>
      </p>
    </MkSection>
  );
}
