// src/components/HowItWorks.tsx
import React from 'react';
import { Compass, Users, CalendarCheck } from 'lucide-react';

const steps = [
  // ... (no changes to the steps array)
  { number: "01", icon: <Compass size={40} />, title: "Explore Vendors & Venues", description: "Search our curated directory of the best professionals in Sri Lanka. Read reviews and view portfolios to find your perfect match." },
  { number: "02", icon: <Users size={40} />, title: "Plan & Collaborate", description: "Use our smart tools to create checklists, manage your budget, and invite family members to a shared dashboard to plan together." },
  { number: "03", icon: <CalendarCheck size={40} />, title: "Book & Manage with Ease", description: "Communicate with vendors, get quotes, and secure your bookings all in one place. Enjoy a stress-free planning experience." }
];

const HowItWorks = () => {
  return (
    // CHANGED: Using cream background and adjusted padding for the curve
    <section style={{ backgroundColor: 'var(--color-cream)' }} className="pt-28 pb-24">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
            How It Works
          </h2>
          <p className="text-lg mt-3 text-gray-600">
            Your dream wedding in three simple steps.
          </p>
        </div>

        {/* Steps Grid (No changes here) */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div 
                className="w-24 h-24 mb-6 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'white', // Changed to white for contrast on cream
                  color: 'var(--color-primary)',
                  border: '2px solid var(--color-primary)'
                }}
              >
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-charcoal)' }}>
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;