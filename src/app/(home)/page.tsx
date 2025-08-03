// src/app/page.tsx
"use client"; // This directive MUST be at the very top

import React, { useState } from 'react'; // Import useState
import Header from "@/components/layout/Header";
import Hero from "@/app/(home)/components/Hero";
import BrowseByCategory from "@/app/(home)/components/BrowseByCategory";
import HowItWorks from "@/app/(home)/components/HowItWorks";
import FeaturedVenues from "@/features/vendor-discovery/components/FeaturedVenues";
import Testimonials from "@/features/vendor-discovery/components/Testimonials";
import Footer from "@/components/layout/Footer";
import AuthModal from '@/features/authentication/AuthModal'; // We will create this next

export default function Home() {
  // State to control the modal's visibility
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <main>
      {/* We pass a function to the Header to open the modal */}
      <Header onLoginClick={() => setAuthModalOpen(true)} />
      
      <Hero />
      <BrowseByCategory />
      <HowItWorks /> 
      <FeaturedVenues />
      <Testimonials />
      <Footer />

      {/* The Modal component itself */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </main>
  );
}