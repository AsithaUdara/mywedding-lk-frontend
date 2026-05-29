import React from "react";
import { type Expense } from "@/shared/lib/api/budget";
import { formatLKR } from "@/shared/components/ui";

const ExpenseList = ({ expenses }: { expenses: Expense[] }) => {
  if (expenses.length === 0) {
    return (
      <div className="mt-8 border-t border-border pt-8">
        <h3 className="mb-4 font-playfair text-lg font-bold text-foreground">Recent expenses</h3>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">No expenses have been added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h3 className="mb-4 font-playfair text-lg font-bold tracking-tight text-foreground">
        Recent expenses
      </h3>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Title
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Date
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.map((expense) => (
              <tr key={expense.id} className="transition-colors hover:bg-muted/30">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                  {expense.title}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right font-bold text-foreground">
                  {formatLKR(expense.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
