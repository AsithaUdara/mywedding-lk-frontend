import React from 'react';
import { BudgetOverview } from '@/lib/api/events';
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
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-medium text-gray-500">Budget Usage</span>
          <span className="text-sm font-bold text-charcoal">{spentPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-primary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>
        </div>
      </div>

      {/* Financial Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-cream/60">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Budget</p>
          <p className="text-2xl font-bold text-charcoal mt-1">{formatCurrency(overview.totalBudget)}</p>
        </div>
        <div className="p-4 rounded-lg bg-cream/60">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(overview.totalSpent)}</p>
        </div>
        <div className="p-4 rounded-lg bg-cream/60">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${overview.remainingBudget < 0 ? 'text-red-600' : 'text-green-700'}`}>
            {formatCurrency(overview.remainingBudget)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewDisplay;