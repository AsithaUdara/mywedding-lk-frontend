"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getBudgetOverview, getExpenses, type BudgetOverview, type Expense } from '@/shared/lib/api/budget';
import { useRealTime } from '@/shared/context/RealTimeContext';
import { Wallet, PlusCircle } from 'lucide-react';
import BudgetOverviewDisplay from './BudgetOverviewDisplay';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';

interface BudgetSectionProps {
  eventId: string;
}

const BudgetSection = ({ eventId }: BudgetSectionProps) => {
  const { user } = useAuth();
  const { budgetVersion } = useRealTime();
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      // Fetch overview and expenses in parallel for better performance
      const [overviewData, expensesData] = await Promise.all([
        getBudgetOverview(token, eventId),
        getExpenses(token, eventId)
      ]);
      setOverview(overviewData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Failed to fetch budget data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, budgetVersion]);

  const handleExpenseAdded = () => {
    setModalOpen(false); // Close modal
    // fetchData(); // No longer needed, SignalR will trigger the refresh
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-white/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="text-primary" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-playfair text-charcoal tracking-tight">Budget Tracker</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Keep your spending in check</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-primary transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            <PlusCircle size={18} />
            <span>Add Expense</span>
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading budget details...</p>
        ) : !overview ? (
          <p className="text-center text-gray-500 py-8">Could not load budget information.</p>
        ) : (
          <div className="space-y-8">
            <BudgetOverviewDisplay overview={overview} />
            <ExpenseList expenses={expenses} />
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        eventId={eventId}
        onExpenseAdded={handleExpenseAdded}
      />
    </>
  );
};

export default BudgetSection;

