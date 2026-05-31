"use client";

import { useState } from "react";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import ConsumerHero from "@/app/(home)/components/ConsumerHero";
import SocialProof from "@/app/(home)/components/SocialProof";
import HowItWorks from "@/app/(home)/components/HowItWorks";
import PricingTiers from "@/app/(home)/components/PricingTiers";
import VendorCTA from "@/app/(home)/components/VendorCTA";
import BrowseByCategory from "@/app/(home)/components/BrowseByCategory";
import FeaturedVenues from "@/modules/vendors/components/FeaturedVenues";
import Testimonials from "@/modules/vendors/components/Testimonials";
import AuthModal from "@/modules/identity/AuthModal";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";

export default function Home() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <RegalFrostShell className="marketing-page marketing-regal-frost">
      <Header onLoginClick={() => setAuthModalOpen(true)} searchMode="expandable" />

      <main>
        <ConsumerHero />
        <SocialProof />
        <BrowseByCategory />
        <FeaturedVenues />
        <Testimonials />
        <HowItWorks />
        <PricingTiers />
        <VendorCTA />
      </main>

      <Footer />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </RegalFrostShell>
  );
}
