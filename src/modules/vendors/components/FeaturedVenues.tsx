import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MkSection, MkSectionHeader } from "@/modules/marketing/marketing-glass-ui";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

const venues = [
  {
    name: "Galle Face Hotel",
    location: "Colombo",
    imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Heritance Kandalama",
    location: "Dambulla",
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Shangri-La Colombo",
    location: "Colombo",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Jetwing Lighthouse",
    location: "Galle",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  },
];

export default function FeaturedVenues() {
  return (
    <MkSection>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <MkSectionHeader
          eyebrow="Discover"
          title="Featured venues"
          align="left"
          className="mx-0 text-left"
        />
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 font-glass-body text-sm font-semibold text-primary transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          View all venues
          <ArrowRight size={18} aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {venues.map((venue) => (
          <Link
            key={venue.name}
            href="/venues"
            className={cn(
              mk.glass,
              "group overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_hsl(345_100%_25%/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={venue.imageUrl}
                alt={venue.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h3 className="font-glass-body text-lg font-semibold text-foreground">{venue.name}</h3>
              <p className={cn(mk.body, "mt-1")}>{venue.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </MkSection>
  );
}
