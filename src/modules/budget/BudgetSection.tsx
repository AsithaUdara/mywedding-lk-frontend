"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBudgetOverview, getExpenses, type BudgetOverview, type Expense } from "@/shared/lib/api/budget";
import { useEventPermission } from "@/shared/hooks/useEventPermission";
import { ViewerReadOnlyNotice } from "@/shared/components/ui/ViewerReadOnlyNotice";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { PlusCircle } from "lucide-react";
import BudgetOverviewDisplay from "./BudgetOverviewDisplay";
import ExpenseList from "./ExpenseList";
import AddExpenseModal from "./AddExpenseModal";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

interface BudgetSectionProps {
  eventId: string;
}

const BudgetSection = ({ eventId }: BudgetSectionProps) => {
  const { user } = useAuth();
  const { budgetVersion } = useRealTime();
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isViewer } = useEventPermission(eventId);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const [overviewData, expensesData] = await Promise.all([
        getBudgetOverview(token, eventId),
        getExpenses(token, eventId),
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
    void fetchData();
  }, [fetchData, budgetVersion]);

  const handleExpenseAdded = () => {
    setModalOpen(false);
  };

  return (
    <>
      <section className={rf.panel}>
        <div className={cn("flex flex-col justify-between gap-4 sm:flex-row sm:items-center", rf.panelHeader)}>
          <div>
            <h2 className={rf.sectionTitle}>Budget tracker</h2>
            <p className={cn("mt-1", vg.subtitle)}>Keep your spending in check</p>
          </div>
          {!isViewer && (
            <GlassButton type="button" variant="primary" onClick={() => setModalOpen(true)} className="gap-2">
              <PlusCircle size={18} aria-hidden />
              Add expense
            </GlassButton>
          )}
        </div>

        <div className={rf.panelBody}>
          {isViewer && <ViewerReadOnlyNotice className="mb-6" />}
          {isLoading ? (
            <p className={cn("py-8 text-center", vg.subtitle)}>Loading budget details…</p>
          ) : !overview ? (
            <p className={cn("py-8 text-center", vg.subtitle)}>Could not load budget information.</p>
          ) : (
            <div className="space-y-8">
              <BudgetOverviewDisplay overview={overview} />
              <ExpenseList expenses={expenses} />
            </div>
          )}
        </div>
      </section>

      {!isViewer && (
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          eventId={eventId}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </>
  );
};

export default BudgetSection;
