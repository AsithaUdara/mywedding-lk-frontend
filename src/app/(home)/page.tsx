"use client";

import { useState } from "react";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import Hero from "@/app/(home)/components/Hero";
import SocialProof from "@/app/(home)/components/SocialProof";
import HowItWorks from "@/app/(home)/components/HowItWorks";
import PricingTiers from "@/app/(home)/components/PricingTiers";
import VendorCTA from "@/app/(home)/components/VendorCTA";
import BrowseByCategory from "@/app/(home)/components/BrowseByCategory";
import FeaturedVenues from "@/modules/vendors/components/FeaturedVenues";
import Testimonials from "@/modules/vendors/components/Testimonials";
import AuthModal from "@/modules/identity/AuthModal";

export default function Home() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="marketing-page font-roboto text-foreground">
      <Header onLoginClick={() => setAuthModalOpen(true)} />

      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <PricingTiers />
        <BrowseByCategory />
        <VendorCTA />
        <FeaturedVenues />
        <Testimonials />
      </main>

      <Footer />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
