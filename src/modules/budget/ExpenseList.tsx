import React from "react";
import { type Expense } from "@/shared/lib/api/budget";
import { formatLKR } from "@/shared/components/ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const ExpenseList = ({ expenses }: { expenses: Expense[] }) => {
  if (expenses.length === 0) {
    return (
      <div className="border-t border-white/40 pt-8">
        <h3 className={cn(rf.sectionTitle, "mb-4 text-lg")}>Recent expenses</h3>
        <div className="rounded-xl border border-dashed border-white/60 bg-white/25 p-8 text-center backdrop-blur-sm">
          <p className={cn("text-sm font-medium", vg.subtitle)}>No expenses have been added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/40 pt-8">
      <h3 className={cn(rf.sectionTitle, "mb-4 text-lg")}>Recent expenses</h3>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/55 bg-white/40 px-5 py-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{expense.title}</p>
              <p className={cn("mt-0.5", vg.caption)}>
                {new Date(expense.expenseDate).toLocaleDateString()}
              </p>
            </div>
            <p className="shrink-0 font-semibold tabular-nums text-foreground">
              {formatLKR(expense.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
