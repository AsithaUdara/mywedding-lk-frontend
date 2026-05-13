"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, CheckSquare, Wallet, Users, Sparkles } from 'lucide-react';

interface EventNavigationProps {
  eventId: string;
}

const EventNavigation = ({ eventId }: EventNavigationProps) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: `/events/${eventId}`, icon: LayoutGrid, exact: true },
    { name: 'Checklist', href: `/events/${eventId}/checklist`, icon: CheckSquare, exact: false },
    { name: 'Budget', href: `/events/${eventId}/budget`, icon: Wallet, exact: false },
    { name: 'Team', href: `/events/${eventId}/team`, icon: Users, exact: false },
    { name: 'Style', href: `/events/${eventId}/style`, icon: Sparkles, exact: false },
  ];

  return (
    <>
      {/* Desktop/Tablet Navigation (Horizontal Tab Bar) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center min-w-max gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation (Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 py-3 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10 scale-110' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EventNavigation;

