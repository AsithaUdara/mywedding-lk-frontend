import React from 'react';
import { type BudgetOverview } from '@/lib/api/budget';
import { motion } from 'framer-motion';

const BudgetOverviewDisplay = ({ overview }: { overview: BudgetOverview }) => {
  // Calculate spent percentage, ensuring it doesn't exceed 100% for the progress bar
  const spentPercentage = overview.totalBudget > 0
    ? Math.min((overview.totalSpent / overview.totalBudget) * 100, 100)
    : 0;

  // Function to format numbers as currency
  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8">
      {/* Premium Progress Bar */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Budget Usage</span>
          <span className="text-2xl font-bold font-playfair text-charcoal">{spentPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <motion.div
            className="bg-primary h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Shimmer effect on progress bar */}
            <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Financial Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Budget</p>
          <p className="text-2xl font-bold text-charcoal">{formatCurrency(overview.totalBudget)}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Spent</p>
          <p className="text-2xl font-bold text-red-600/90">{formatCurrency(overview.totalSpent)}</p>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${overview.remainingBudget < 0 ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
          <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${overview.remainingBudget < 0 ? 'text-red-400' : 'text-green-600/70'}`}>Remaining</p>
          <p className={`text-2xl font-bold ${overview.remainingBudget < 0 ? 'text-red-700' : 'text-green-700'}`}>
            {formatCurrency(overview.remainingBudget)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewDisplay;