"use client";

import React, { useState } from "react";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import AuthModal from "@/modules/identity/AuthModal";
import { VendorDetailAuthProvider } from "@/modules/vendors/context/VendorDetailAuthContext";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";

const VendorDetailClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <VendorDetailAuthProvider>
      <RegalFrostShell mesh className="flex min-h-screen flex-col">
        <Header onLoginClick={() => setAuthModalOpen(true)} />
        {children}
        <Footer />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </RegalFrostShell>
    </VendorDetailAuthProvider>
  );
};

export default VendorDetailClientWrapper;
