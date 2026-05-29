// src/app/vendors/page.tsx
"use client";

import React, { useState } from "react";

import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import AuthModal from "@/modules/identity/AuthModal";
import StyleCard from "@/modules/vendors/components/StyleCard";
import AmenityCard from "@/modules/vendors/components/AmenityCard";
import HeroWithSearch from "./components/HeroWithSearch";
import { VendorsHubProvider, useVendorsHub } from "./components/VendorsHubClient";
import { VendorsHubAllGrid, VendorsHubTopRated } from "./components/VendorsHubSections";
import { Star, Camera, Music } from "lucide-react";

const VendorsHubPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const styleCategories = [
    {
      title: "Luxury Venues",
      subtitle: "Grand hotels and beautiful estates",
      imageUrl:
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Candid Photography",
      subtitle: "Capturing authentic, timeless moments",
      imageUrl:
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Tropical Florists",
      subtitle: "Vibrant, exotic arrangements",
      imageUrl:
        "https://images.unsplash.com/photo-1654532388036-967f71e1e92e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const popularAmenities = [
    { title: "5-star Rated", icon: <Star size={24} /> },
    { title: "Drone Photography", icon: <Camera size={24} /> },
    { title: "Live Music", icon: <Music size={24} /> },
  ];

  return (
    <>
      <main className="bg-background font-roboto">
        <Header onLoginClick={() => setAuthModalOpen(true)} />

        <HeroWithSearch
          imageUrl="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80"
          searchType="vendor"
        />

        <VendorsHubProvider>
          <div className="container mx-auto space-y-20 px-4 py-16">
            <VendorsHubTopRatedWrapper />

            <section>
              <h2 className="mb-8 font-playfair text-3xl font-bold text-foreground sm:text-4xl">
                Services for every style
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {styleCategories.map((style) => (
                  <StyleCard key={style.title} {...style} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-8 font-playfair text-3xl font-bold text-foreground sm:text-4xl">
                Popular features and services
              </h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {popularAmenities.map((amenity) => (
                  <AmenityCard key={amenity.title} {...amenity} />
                ))}
              </div>
            </section>

            <VendorsHubAllGridWrapper />
          </div>
        </VendorsHubProvider>

        <Footer />
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

function VendorsHubTopRatedWrapper() {
  const { vendors, loading } = useVendorsHub();
  return <VendorsHubTopRated vendors={vendors} loading={loading} />;
}

function VendorsHubAllGridWrapper() {
  const { vendors, loading } = useVendorsHub();
  return <VendorsHubAllGrid vendors={vendors} loading={loading} />;
}

export default VendorsHubPage;
