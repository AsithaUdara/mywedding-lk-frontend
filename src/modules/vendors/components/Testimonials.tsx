import { Quote, MapPin } from "lucide-react";
import { MkSection, MkSectionHeader } from "@/modules/marketing/marketing-glass-ui";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

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
    <MkSection alt className="overflow-hidden">
      <MkSectionHeader
        eyebrow="Social proof"
        title="Trusted by planners & vendors"
      />

      <div className="mx-auto mt-12 max-w-full overflow-hidden">
        <div className="flex flex-nowrap gap-6 animate-scroll-left hover:pause">
          {extendedTestimonials.map((testimonial, index) => (
            <figure
              key={`${testimonial.name}-${index}`}
              className={cn(
                mk.card,
                "flex w-[min(100%,22rem)] flex-shrink-0 flex-col"
              )}
            >
              <Quote size={32} className="text-primary/40 rotate-180" aria-hidden />
              <blockquote className={cn(mk.body, "mt-4 flex-1 text-base")}>
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-white/40 pt-4">
                <p className="font-glass-body font-semibold text-foreground">{testimonial.name}</p>
                <p className="mt-1 flex items-center gap-1.5 font-glass-body text-sm text-muted-foreground">
                  <MapPin size={14} className="text-[hsl(42_48%_52%)]" aria-hidden />
                  {testimonial.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </MkSection>
  );
}
