// File: src/app/vendor/[vendorId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { getVendorById } from "@/shared/lib/api/vendors";
import VendorDetailClientWrapper from "@/modules/vendors/components/VendorDetailClientWrapper";
import VendorDetailContent from "@/modules/vendors/components/VendorDetailContent";

export async function generateStaticParams() {
  return [];
}

const VendorDetailPage = async ({ params }: { params: Promise<{ vendorId: string }> }) => {
  const { vendorId } = await params;
  const vendor = await getVendorById(vendorId);

  if (!vendor) {
    notFound();
  }

  const mapQuery = encodeURIComponent(
    [vendor.businessName, vendor.city, vendor.province, "Sri Lanka"].filter(Boolean).join(", ")
  );
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${mapQuery}`;

  return (
    <VendorDetailClientWrapper>
      <VendorDetailContent vendor={vendor} mapUrl={mapUrl} />
    </VendorDetailClientWrapper>
  );
};

export default VendorDetailPage;
