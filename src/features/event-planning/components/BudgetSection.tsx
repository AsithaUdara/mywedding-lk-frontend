// File: src/features/event-planning/components/BudgetSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getBudgetOverview, getExpenses, BudgetOverview, Expense } from '@/lib/api/events';
import { Wallet, PlusCircle } from 'lucide-react';
import BudgetOverviewDisplay from './BudgetOverviewDisplay';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';

interface BudgetSectionProps {
  eventId: string;
}

const BudgetSection = ({ eventId }: BudgetSectionProps) => {
  const { user } = useAuth();
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
  }, [fetchData]);

  const handleExpenseAdded = () => {
    setModalOpen(false); // Close modal
    fetchData();         // Re-fetch all data to update UI
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <Wallet className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-charcoal">Budget Tracker</h2>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-opacity-90 transition-colors"
          >
            <PlusCircle size={16} />
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
