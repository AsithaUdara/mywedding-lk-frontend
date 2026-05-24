"use client";

import React from "react";
import Link from "next/link";
import VendorCard from "@/modules/vendors/components/VendorCard";
import HorizontalScrollSection from "@/shared/components/ui/HorizontalScrollSection";
import { Vendor } from "@/shared/lib/api/vendors";
import { mapVendorToCardProps } from "@/shared/lib/vendorMedia";

interface Props {
  vendors: Vendor[];
  loading: boolean;
}

export function VendorsHubTopRated({ vendors, loading }: Props) {
  if (loading) {
    return <p className="py-8 text-center text-slate-500">Loading top vendors...</p>;
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
    return <p className="py-8 text-center text-slate-500">Loading vendors...</p>;
  }

  if (vendors.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-charcoal">No verified vendors yet</h2>
        <p className="mt-2 text-slate-600">
          Vendors appear here after admin verification and at least one active service.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-8 text-4xl font-bold text-charcoal">All Vendors in Sri Lanka</h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {vendors.slice(0, 8).map((vendor) => (
          <VendorCard key={vendor.userId} vendor={mapVendorToCardProps(vendor)} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/vendors/search">
          <button className="rounded-lg border-2 border-charcoal px-8 py-4 font-bold text-charcoal transition-colors hover:bg-cream">
            Show all {vendors.length} vendors
          </button>
        </Link>
      </div>
    </section>
  );
}
