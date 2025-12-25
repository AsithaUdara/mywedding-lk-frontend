// src/app/vendor/[vendorId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import allVendorsData from '@/lib/data/vendors.json';

// Import all our components
import VendorDetailClientWrapper from '@/features/vendor-discovery/components/VendorDetailClientWrapper';
import ImageGallery from '@/features/vendor-discovery/components/ImageGallery';
import BookingPanel from '@/features/vendor-discovery/components/BookingPanel';
import VendorHighlights from '@/features/vendor-discovery/components/VendorHighlights';
import ReviewCard from '@/features/vendor-discovery/components/ReviewCard';
import { MapPin, Star, Award, Check, Gem, Waves, Camera, Music, Utensils } from 'lucide-react';

export async function generateStaticParams() {
  return allVendorsData.map((vendor) => ({
    vendorId: vendor.id.toString(),
  }));
}

const getTagIcon = (tag: string) => {
  switch (tag.toLowerCase()) {
    case 'luxury': return <Gem size={24} />;
    case 'beachfront': return <Waves size={24} />;
    case '5-star': return <Star size={24} />;
    case 'candid':
    case 'drone': return <Camera size={24} />;
    case 'live music': return <Music size={24} />;
    case 'international cuisine': return <Utensils size={24} />;
    default: return <Check size={24} />;
  }
};

const VendorDetailPage = async ({ params }: { params: { vendorId: string } }) => {
  const vendor = allVendorsData.find(v => v.id.toString() === params.vendorId);
  if (!vendor) { notFound(); }

  const dummyReviews = [
    { name: "Anusha & Raj", date: "August 2025", rating: 5, text: "Absolutely breathtaking work! They captured our day perfectly. The team was professional, creative, and made us feel so comfortable. Highly recommended!" },
    { name: "Sameer & Fathima", date: "July 2025", rating: 5, text: "The venue was a dream come true. The staff went above and beyond for our special day, and our guests are still talking about the stunning views and incredible food." },
    { name: "Dilantha Perera", date: "June 2025", rating: 4, text: "A truly professional experience from start to finish. The planning tools made collaboration with my family so much easier than I ever imagined." },
    { name: "Priya & Nimal", date: "May 2025", rating: 5, text: "We couldn't have asked for a better band! They kept the dance floor full all night and played the perfect mix of traditional and modern music. Thank you!" }
  ];

  const mapQuery = encodeURIComponent(`${vendor.name}, ${vendor.location}, Sri Lanka`);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAZXfMfsfRyCaPwkugdAlXNobgPHIQsH30&q=${mapQuery}`;

  return (
    <VendorDetailClientWrapper>
      <main className="bg-white">
        <div className="container mx-auto px-4 py-8">
          
          <div className="mb-4">
            <h1 className="text-4xl font-bold">{vendor.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mt-2">
              <div className="flex items-center"><Star size={16} className="mr-1 text-accent"/> {vendor.rating.toFixed(1)} ({vendor.reviews} reviews)</div>
              <span>·</span>
              <div className="flex items-center"><MapPin size={16} className="mr-1"/> {vendor.location}, Sri Lanka</div>
              {vendor.tags.includes("5-star") && (
                <>
                  <span>·</span>
                  <div className="flex items-center"><Award size={16} className="mr-1 text-green-600"/> Top-rated Vendor</div>
                </>
              )}
            </div>
          </div>

          <ImageGallery images={vendor.images} vendorName={vendor.name} />

          <div className="relative flex flex-col md:flex-row gap-16 mt-32 pb-12">
            
            <div className="w-full md:w-3/5">
              <VendorHighlights rating={vendor.rating} tags={vendor.tags} />
              
              <div className="py-8 border-b">
                <h3 className="text-2xl font-bold mb-4">About this vendor</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{vendor.description}</p>
              </div>

              <div className="py-8 border-b">
                <h3 className="text-2xl font-bold mb-6">What this vendor offers</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-lg">
                  {vendor.tags.map(tag => (
                    <div key={tag} className="flex items-center space-x-4">
                      <div className="text-primary">{getTagIcon(tag)}</div>
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="py-8">
                <h3 className="text-2xl font-bold mb-6">Guest Reviews ({vendor.reviews})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {dummyReviews.slice(0, 4).map(review => (
                    <ReviewCard key={review.name} review={review} />
                  ))}
                </div>
                <button className="mt-8 px-6 py-3 border-2 border-charcoal rounded-lg font-bold text-charcoal hover:bg-cream transition-colors">
                  Show all {vendor.reviews} reviews
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-2/5">
              <div className="sticky top-40">
                <BookingPanel price={vendor.price} rating={vendor.rating} reviews={vendor.reviews} />
              </div>
            </div>
          </div>

          {/* MAP SECTION - AIRBNB STYLE WITH FULL WIDTH BORDER */}
          <div className="py-8 border-t border-gray-300">
            <h3 className="text-2xl font-bold mb-4">Where you'll be</h3>
            <p className="text-gray-600 mb-6">{vendor.location}, Sri Lanka</p>
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