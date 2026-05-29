"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getBudgetOverview, getExpenses, type BudgetOverview, type Expense } from '@/shared/lib/api/budget';
import { useRealTime } from '@/shared/context/RealTimeContext';
import { Wallet, PlusCircle } from 'lucide-react';
import BudgetOverviewDisplay from './BudgetOverviewDisplay';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import { Button } from '@/shared/components/ui';

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
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="text-primary" size={24} strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <h2 className="font-playfair text-2xl font-bold tracking-tight text-foreground">
                Budget tracker
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Keep your spending in check
              </p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)} variant="primary" className="gap-2">
            <PlusCircle size={18} aria-hidden />
            <span>Add expense</span>
          </Button>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground">Loading budget details…</p>
        ) : !overview ? (
          <p className="py-8 text-center text-muted-foreground">Could not load budget information.</p>
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

