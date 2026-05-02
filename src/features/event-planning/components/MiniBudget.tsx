"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getBudgetOverview, type BudgetOverview } from '@/lib/api/budget';
import { useRealTime } from '@/context/RealTimeContext';
import { Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

const MiniBudget = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { budgetVersion } = useRealTime();
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getBudgetOverview(token, eventId);
      setOverview(data);
    } catch (error) {
      console.error("Failed to fetch budget overview:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget, budgetVersion]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/60">
        <Skeleton className="h-8 w-1/3 mb-6 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!overview) return null;

  const spentPercentage = overview.totalBudget > 0
    ? Math.min((overview.totalSpent / overview.totalBudget) * 100, 100)
    : 0;

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/60">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="text-primary" size={16} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold font-playfair text-charcoal tracking-tight">Budget Tracker</h2>
        </div>
        <Link 
          href={`/events/${eventId}/budget`}
          className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 hover:text-primary/70 transition-colors"
        >
          Manage <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usage</span>
            <span className="text-lg font-bold text-charcoal">{spentPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-primary h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${spentPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Spent</p>
            <p className="text-sm font-bold text-red-600/90">{formatCurrency(overview.totalSpent)}</p>
          </div>
          <div className={`p-3 rounded-xl border ${overview.remainingBudget < 0 ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${overview.remainingBudget < 0 ? 'text-red-400' : 'text-green-600/70'}`}>Remaining</p>
            <p className={`text-sm font-bold ${overview.remainingBudget < 0 ? 'text-red-700' : 'text-green-700'}`}>
              {formatCurrency(overview.remainingBudget)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniBudget;
