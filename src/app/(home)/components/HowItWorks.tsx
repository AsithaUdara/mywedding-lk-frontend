import React from 'react';
import { LayoutDashboard, Handshake, Wallet } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: <LayoutDashboard size={40} />,
    title: "Run your agency workspace",
    description: "Manage client events on a Kanban CRM board, master Gantt timelines, and vendor shortlists from one B2B dashboard.",
  },
  {
    number: "02",
    icon: <Handshake size={40} />,
    title: "Collaborate with clients & vendors",
    description: "Send proposals for client approval, track vendor inquiries, and keep everyone aligned with real-time notifications.",
  },
  {
    number: "03",
    icon: <Wallet size={40} />,
    title: "Book, sign, and get paid",
    description: "Digital contracts with audit trails, booking deposits via PayHere, and automated commission tracking for the platform.",
  },
];

const HowItWorks = () => {
  return (
    <section style={{ backgroundColor: 'var(--color-cream)' }} className="pt-28 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold" style={{ color: 'var(--color-charcoal)' }}>
            Built for professional planners
          </h2>
          <p className="text-lg mt-3 text-gray-600">
            Three pillars of your B2B2C operating system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div
                className="w-24 h-24 mb-6 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--color-primary)',
                  border: '2px solid var(--color-primary)',
                }}
              >
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-charcoal)' }}>
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
