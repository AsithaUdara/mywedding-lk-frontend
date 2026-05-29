import { Quote, MapPin } from "lucide-react";

const testimonials = [
  {
    quote:
      "We moved off spreadsheets in a week. Client approvals and vendor shortlists finally live in one workspace.",
    name: "Nethmi & Studio Eleven",
    role: "Planning agency · Colombo",
  },
  {
    quote:
      "The procurement pipeline alone saved us hours per wedding — pending, approved, and deposit status at a glance.",
    name: "Kavindu Perera",
    role: "Lead planner · Kandy",
  },
  {
    quote:
      "Inquiries from planners are higher quality. Our Vendor Hub keeps availability and quotes organized.",
    name: "Island Bloom Florists",
    role: "Verified vendor · Galle",
  },
];

const extendedTestimonials = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="border-t border-border/60 bg-background py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Social proof</p>
          <h2 className="mt-3 font-playfair text-3xl font-bold text-foreground md:text-4xl">
            Trusted by planners & vendors
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-full overflow-hidden">
          <div className="flex flex-nowrap gap-6 animate-scroll-left hover:pause">
            {extendedTestimonials.map((testimonial, index) => (
              <figure
                key={`${testimonial.name}-${index}`}
                className="flex w-[min(100%,22rem)] flex-shrink-0 flex-col rounded-3xl border border-border bg-background p-8 shadow-sm"
              >
                <Quote size={32} className="text-primary/40 rotate-180" aria-hidden />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin size={14} className="text-accent" aria-hidden />
                    {testimonial.role}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
