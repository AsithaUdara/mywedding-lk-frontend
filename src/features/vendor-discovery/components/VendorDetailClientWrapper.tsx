// src/features/vendor-discovery/components/VendorDetailClientWrapper.tsx
"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthModal from '@/features/authentication/AuthModal';

// This component wraps our page content and provides the interactive parts
const VendorDetailClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setAuthModalOpen(true)} />
      {children} {/* This is where our server-rendered page content will go */}
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default VendorDetailClientWrapper;