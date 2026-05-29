import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/shared/components/ui";

export default function VendorCTA() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div
            className="absolute inset-0 marketing-hero--pattern opacity-40"
            aria-hidden
          />
          <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12 lg:p-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Store size={14} className="text-accent" aria-hidden />
                For vendors & venues
              </div>
              <h2 className="mt-4 font-playfair text-2xl font-bold text-foreground md:text-3xl">
                List your business on Sri Lanka&apos;s curated wedding directory
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                Reach couples and professional planners actively shortlisting vendors. Manage inquiries,
                availability, and bookings from your Vendor Hub workspace.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button href="/vendor/signup" size="lg" className="w-full sm:w-auto">
                List your business
                <ArrowRight size={18} aria-hidden />
              </Button>
              <Button href="/vendor/login" variant="secondary" size="lg" className="w-full sm:w-auto">
                Vendor login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
