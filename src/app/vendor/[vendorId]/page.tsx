// File: src/app/vendor/[vendorId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { getVendorById } from "@/shared/lib/api/vendors";

import VendorDetailClientWrapper from "@/modules/vendors/components/VendorDetailClientWrapper";
import VendorDetailContent from "@/modules/vendors/components/VendorDetailContent";
import VendorHighlights from "@/modules/vendors/components/VendorHighlights";
import ReviewCard from "@/modules/vendors/components/ReviewCard";
import { MapPin, Star, Award, Phone, Globe } from "lucide-react";

export async function generateStaticParams() {
  return [];
}

const VendorDetailPage = async ({ params }: { params: Promise<{ vendorId: string }> }) => {
  const { vendorId } = await params;
  const vendor = await getVendorById(vendorId);

  if (!vendor) {
    notFound();
  }

  const mapQuery = encodeURIComponent(`${vendor.businessName}, ${vendor.city}, Sri Lanka`);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAZXfMfsfRyCaPwkugdAlXNobgPHIQsH30&q=${mapQuery}`;

  return (
    <VendorDetailClientWrapper>
      <main className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold">{vendor.businessName}</h1>
            <div className="mt-2 flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-accent" /> {vendor.averageRating.toFixed(1)} (
                {vendor.reviews.length} reviews)
              </div>
              <span>·</span>
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" /> {vendor.city}, Sri Lanka
              </div>
              {vendor.verificationStatus === "Verified" && (
                <>
                  <span>·</span>
                  <div className="flex items-center">
                    <Award size={16} className="mr-1 text-green-600" /> Verified Vendor
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {vendor.contactPhone && (
                <a
                  href={`tel:${vendor.contactPhone}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-charcoal hover:border-primary/40 hover:text-primary"
                >
                  <Phone size={14} />
                  {vendor.contactPhone}
                </a>
              )}
              {vendor.websiteUrl && (
                <a
                  href={vendor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-charcoal hover:border-primary/40 hover:text-primary"
                >
                  <Globe size={14} />
                  Visit website
                </a>
              )}
            </div>
          </div>

          <VendorHighlights rating={vendor.averageRating} tags={[]} />

          <div className="border-b py-8">
            <h3 className="mb-4 text-2xl font-bold">About this vendor</h3>
            <p className="text-lg leading-relaxed text-gray-700">{vendor.businessDescription}</p>
          </div>

          <VendorDetailContent vendor={vendor} />

          <div className="py-8">
            <h3 className="mb-6 text-2xl font-bold">Guest Reviews ({vendor.reviews.length})</h3>
            {vendor.reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                {vendor.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      name: review.reviewerName,
                      date: new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      }),
                      rating: review.rating,
                      text: review.reviewContent,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet for this vendor.</p>
            )}
          </div>

          <div className="border-t border-gray-300 py-8">
            <h3 className="mb-4 text-2xl font-bold">Where you&apos;ll be</h3>
            <p className="mb-6 text-gray-600">{vendor.city}, Sri Lanka</p>
            <div className="relative mx-auto h-[500px] w-4/5 overflow-hidden rounded-xl bg-gray-200">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </VendorDetailClientWrapper>
  );
};

export default VendorDetailPage;
