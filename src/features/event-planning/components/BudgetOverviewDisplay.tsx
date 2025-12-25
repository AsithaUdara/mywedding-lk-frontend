// File: src/features/event-planning/components/BudgetOverviewDisplay.tsx
import React from 'react';
import { BudgetOverview } from '@/lib/api/events';

const BudgetOverviewDisplay = ({ overview }: { overview: BudgetOverview }) => {
  const spentPercentage = overview.totalBudget > 0 ? (overview.totalSpent / overview.totalBudget) * 100 : 0;

  // Function to format numbers as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-cream/50 rounded-lg">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-charcoal">{formatCurrency(overview.totalBudget)}</p>
        </div>
        <div className="p-4 bg-cream/50 rounded-lg">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(overview.totalSpent)}</p>
        </div>
        <div className="p-4 bg-cream/50 rounded-lg">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(overview.remainingBudget)}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{spentPercentage.toFixed(0)}% of budget used</p>
      </div>
    </div>
  );
};

export default BudgetOverviewDisplay;
