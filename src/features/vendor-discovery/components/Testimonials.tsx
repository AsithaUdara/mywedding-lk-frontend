// src/components/Testimonials.tsx
import React from 'react';
import { Quote, CheckCircle } from 'lucide-react';

const testimonials = [
  { quote: "MyWedding.lk made our planning process a breeze. The vendor matching was spot on and saved us weeks of searching!", name: "Anusha & Raj", location: "Kandy, Sri Lanka", },
  { quote: "The collaborative dashboard was a game-changer for our families. Everyone was on the same page, and it made decisions so much easier. Highly recommend!", name: "Fathima & Sameer", location: "Colombo, Sri Lanka", },
  { quote: "As a wedding photographer, this platform has been incredible for connecting with new clients. The interface is clean and professional.", name: "Dilantha Perera", location: "Galle, Sri Lanka (Vendor)", },
];
const extendedTestimonials = [...testimonials, ...testimonials];

const Testimonials = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
            Trusted by Couples & Vendors
          </h2>
          <p className="text-lg mt-3 text-gray-600">
            Real stories from our amazing community.
          </p>
        </div>

        {/* The Viewport: Masks the scrolling content - constrained to show 3 cards */}
        <div className="mx-auto overflow-hidden" style={{ width: '1216px', maxWidth: 'calc(100vw - 4rem)' }}>
          {/* THE FIX IS HERE: Added 'flex-nowrap' to the class list */}
          <div className="flex flex-nowrap gap-8 animate-scroll-left hover:pause">
            {extendedTestimonials.map((testimonial, index) => (
              // The Card
              <div 
                key={index} 
                className="p-8 rounded-xl flex flex-col w-96 flex-shrink-0"
                style={{ backgroundColor: 'var(--color-cream)' }}
              >
                <Quote 
                  size={40} 
                  className="mb-4 transform rotate-180"
                  style={{ color: 'var(--color-primary)' }}
                />
                <p className="text-gray-700 italic text-lg mb-6 flex-grow">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="mt-auto">
                  <p className="font-bold text-xl" style={{ color: 'var(--color-charcoal)' }}>
                    {testimonial.name}
                  </p>
                  <p className="text-gray-500 flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-600"/>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;