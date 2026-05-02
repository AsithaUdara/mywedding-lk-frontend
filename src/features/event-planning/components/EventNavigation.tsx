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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-8 overflow-x-auto no-scrollbar">
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
  );
};

export default EventNavigation;
