// File: src/app/vendor/[vendorId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getVendorById } from '@/lib/api/vendors';

// Import all our components
import VendorDetailClientWrapper from '@/features/vendor-discovery/components/VendorDetailClientWrapper';
import ImageGallery from '@/features/vendor-discovery/components/ImageGallery';
import BookingPanel from '@/features/vendor-discovery/components/BookingPanel';
import VendorHighlights from '@/features/vendor-discovery/components/VendorHighlights';
import ReviewCard from '@/features/vendor-discovery/components/ReviewCard';
import { MapPin, Star, Award } from 'lucide-react';

export async function generateStaticParams() {
  return [];
}

const VendorDetailPage = async ({ params }: { params: Promise<{ vendorId: string }> }) => {
  const { vendorId } = await params;
  
  // Fetch live data from the backend
  const vendor = await getVendorById(vendorId);

  if (!vendor) {
    notFound();
  }

  const mapQuery = encodeURIComponent(`${vendor.businessName}, ${vendor.city}, Sri Lanka`);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAZXfMfsfRyCaPwkugdAlXNobgPHIQsH30&q=${mapQuery}`;

  // Use the first service's price for the booking panel, or a default
  const displayPrice = vendor.services.length > 0 ? vendor.services[0].basePrice : 0;
  const firstServiceId = vendor.services.length > 0 ? vendor.services[0].id : undefined;
  
  // Create some dummy images for the gallery until this is in the DB
  const displayImages = [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550957884-219abc414674?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542042161-d703d1a00d06?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587899949692-78893d58dec3?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <VendorDetailClientWrapper>
      <main className="bg-white">
        <div className="container mx-auto px-4 py-8">
          
          <div className="mb-4">
            <h1 className="text-4xl font-bold">{vendor.businessName}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mt-2">
              <div className="flex items-center"><Star size={16} className="mr-1 text-accent"/> {vendor.averageRating.toFixed(1)} ({vendor.reviews.length} reviews)</div>
              <span>·</span>
              <div className="flex items-center"><MapPin size={16} className="mr-1"/> {vendor.city}, Sri Lanka</div>
              {vendor.verificationStatus === 'Verified' && (
                <>
                  <span>·</span>
                  <div className="flex items-center"><Award size={16} className="mr-1 text-green-600"/> Verified Vendor</div>
                </>
              )}
            </div>
          </div>

          <ImageGallery images={displayImages} vendorName={vendor.businessName} />

          <div className="relative flex flex-col md:flex-row gap-16 mt-32 pb-12">
            
            <div className="w-full md:w-3/5">
              <VendorHighlights rating={vendor.averageRating} tags={[]} />
              
              <div className="py-8 border-b">
                <h3 className="text-2xl font-bold mb-4">About this vendor</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{vendor.businessDescription}</p>
              </div>

              <div className="py-8 border-b">
                <h3 className="text-2xl font-bold mb-6">Services Offered</h3>
                <div className="space-y-4">
                  {vendor.services.map(service => (
                    <div key={service.id} className="p-4 border rounded-lg">
                      <h4 className="font-bold text-lg">{service.serviceName}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className="text-right font-semibold text-primary mt-2">Starts from LKR {service.basePrice.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="py-8">
                <h3 className="text-2xl font-bold mb-6">Guest Reviews ({vendor.reviews.length})</h3>
                {vendor.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {vendor.reviews.map(review => (
                        <ReviewCard key={review.id} review={{
                            name: review.reviewerName,
                            date: new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                            rating: review.rating,
                            text: review.reviewContent
                        }} />
                    ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No reviews yet for this vendor.</p>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/5">
              <div className="sticky top-40 z-30">
                <BookingPanel 
                  price={displayPrice} 
                  rating={vendor.averageRating} 
                  reviews={vendor.reviews.length}
                  vendorName={vendor.businessName}
                  serviceId={firstServiceId}
                />
              </div>
            </div>
          </div>

          {/* MAP SECTION - AIRBNB STYLE WITH FULL WIDTH BORDER */}
          <div className="py-8 border-t border-gray-300">
            <h3 className="text-2xl font-bold mb-4">Where you&apos;ll be</h3>
            <p className="text-gray-600 mb-6">{vendor.city}, Sri Lanka</p>
            <div className="h-[500px] w-4/5 mx-auto bg-gray-200 rounded-xl overflow-hidden relative">
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
