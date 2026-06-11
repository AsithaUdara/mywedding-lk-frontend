import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { MkSection } from "@/modules/marketing/marketing-glass-ui";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

export default function VendorCTA() {
  return (
    <MkSection className="pb-20 md:pb-28">
      <div className={cn(mk.glass, "relative overflow-hidden rounded-2xl")}>
        <div className="absolute inset-0 marketing-hero--pattern opacity-30" aria-hidden />
        <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12 lg:p-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(42_48%_52%/0.15)] px-3 py-1 text-xs font-semibold text-[hsl(42_35%_38%)]">
              <Store size={14} className="text-[hsl(42_48%_52%)]" aria-hidden />
              For vendors & venues
            </div>
            <h2 className="font-playfair mt-4 text-2xl font-normal text-foreground md:text-3xl">
              List your business on Sri Lanka&apos;s curated wedding directory
            </h2>
            <p className={cn(mk.body, "mt-3 max-w-lg md:text-base")}>
              Reach couples and professional planners actively shortlisting vendors. Manage inquiries,
              availability, and bookings from your Vendor Hub workspace.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href="/vendor/signup" className={cn(mk.btnPrimary, "w-full sm:w-auto")}>
              List your business
              <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/vendor/login" className={cn(mk.btnGhost, "w-full sm:w-auto")}>
              Vendor login
            </Link>
          </div>
        </div>
      </div>
    </MkSection>
  );
}
