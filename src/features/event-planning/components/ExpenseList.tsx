// File: src/features/event-planning/components/ExpenseList.tsx
import React from 'react';
import { Expense } from '@/lib/api/events';

const ExpenseList = ({ expenses }: { expenses: Expense[] }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-charcoal mb-2">Expenses</h3>
        <p className="text-sm text-gray-500">No expenses have been added yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-charcoal mb-4">Expenses</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-500 uppercase bg-cream/50">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-charcoal whitespace-nowrap">{expense.title}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-semibold text-charcoal text-right">{formatCurrency(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
