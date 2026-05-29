import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section className="marketing-section-alt py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Discover</p>
            <h2 className="mt-2 font-playfair text-3xl font-bold text-foreground md:text-4xl">Featured venues</h2>
          </div>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
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
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <h3 className="text-lg font-bold text-foreground">{venue.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{venue.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
