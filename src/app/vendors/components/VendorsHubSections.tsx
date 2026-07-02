"use client";

import VendorCard from "@/modules/vendors/components/VendorCard";
import HorizontalScrollSection from "@/shared/components/ui/HorizontalScrollSection";
import { Button, EmptyState } from "@/shared/components/ui";
import { Vendor } from "@/shared/lib/api/vendors";
import { mapVendorToCardProps } from "@/shared/lib/vendorMedia";
import { Package } from "lucide-react";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface Props {
  vendors: Vendor[];
  loading: boolean;
}

export function VendorsHubTopRated({ vendors, loading }: Props) {
  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Loading top vendors…</p>
    );
  }

  if (vendors.length === 0) {
    return null;
  }

  const topRated = [...vendors].sort((a, b) => b.averageRating - a.averageRating).slice(0, 8);

  return (
    <HorizontalScrollSection
      title="Top-rated vendors in Sri Lanka"
      subtitle="Guests agree: these vendors are highly rated for their service and quality."
    >
      {topRated.map((vendor) => (
        <div key={vendor.userId} className="flex-shrink-0" style={{ width: "calc(25% - 18px)" }}>
          <VendorCard vendor={mapVendorToCardProps(vendor)} />
        </div>
      ))}
    </HorizontalScrollSection>
  );
}

export function VendorsHubAllGrid({ vendors, loading }: Props) {
  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Loading vendors…</p>
    );
  }

  if (vendors.length === 0) {
    return (
      <EmptyState
        title="No verified vendors yet"
        description="Vendors appear here after admin verification and at least one active service."
        icon={Package}
      />
    );
  }

  return (
    <section>
      <h2 className={cn("mb-8", rf.marketingSectionTitle)}>
        All vendors in Sri Lanka
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {vendors.slice(0, 8).map((vendor) => (
          <VendorCard key={vendor.userId} vendor={mapVendorToCardProps(vendor)} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button href="/vendors/search" variant="secondary" size="lg">
          Show all {vendors.length} vendors
        </Button>
      </div>
    </section>
  );
}
