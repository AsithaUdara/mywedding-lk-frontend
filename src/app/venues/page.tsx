"use client";

import React, { useState } from "react";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import HorizontalScrollSection from "@/shared/components/ui/HorizontalScrollSection";
import AuthModal from "@/modules/identity/AuthModal";
import VendorCard from "@/modules/vendors/components/VendorCard";
import StyleCard from "@/modules/vendors/components/StyleCard";
import HeroWithSearch from "@/app/vendors/components/HeroWithSearch";
import { Button } from "@/shared/components/ui";
import allVendorsData from "@/shared/lib/data/vendors.json";

type VenueJson = (typeof allVendorsData)[number];

function venueToCardProps(v: VenueJson) {
  return {
    id: String(v.id),
    name: v.name,
    category: v.category,
    location: v.location,
    images: v.images,
    rating: v.rating,
    price: v.price,
    totalReviews: v.reviews,
  };
}

const VenuesHubPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const allVenues = allVendorsData.filter((v) => v.category === "Venues");
  const topRatedVenues = allVenues.filter((v) => v.rating >= 4.9);

  const styleCategories = [
    {
      title: "Beachfront Venues",
      subtitle: 'Say "I do" with an ocean view',
      imageUrl:
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Luxury Hotels",
      subtitle: "Grand ballrooms and elegant estates",
      imageUrl:
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mountain Escapes",
      subtitle: "Serene ceremonies with stunning views",
      imageUrl:
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <>
      <main className="bg-background font-roboto">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        <HeroWithSearch
          imageUrl="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1600&q=80"
          searchType="venue"
        />

        <div className="container mx-auto space-y-20 px-4 py-16">
          <HorizontalScrollSection
            title="Top-rated venues in Sri Lanka"
            subtitle="Couples agree: these venues are highly rated for their beauty and service."
          >
            {topRatedVenues.map((vendor) => (
              <div key={vendor.id} className="flex-shrink-0" style={{ width: "calc(25% - 18px)" }}>
                <VendorCard vendor={venueToCardProps(vendor)} />
              </div>
            ))}
          </HorizontalScrollSection>

          <section>
            <h2 className="mb-8 font-playfair text-3xl font-bold text-foreground sm:text-4xl">
              Venues for every style
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {styleCategories.map((style) => (
                <StyleCard key={style.title} {...style} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-8 font-playfair text-3xl font-bold text-foreground sm:text-4xl">
              All venues in Sri Lanka
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {allVenues.slice(0, 8).map((vendor) => (
                <VendorCard key={vendor.id} vendor={venueToCardProps(vendor)} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button href="/vendors/search?category=Venue" variant="secondary" size="lg">
                Show all {allVenues.length} venues
              </Button>
            </div>
          </section>
        </div>
        <Footer />
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default VenuesHubPage;
