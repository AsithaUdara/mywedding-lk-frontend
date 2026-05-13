import React from 'react';
import { type Expense } from '@/shared/lib/api/budget';

const ExpenseList = ({ expenses }: { expenses: Expense[] }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold font-playfair text-charcoal mb-4">Recent Expenses</h3>
        <div className="bg-gray-50/50 rounded-xl p-8 text-center border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">No expenses have been added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <h3 className="text-lg font-bold font-playfair text-charcoal mb-4 tracking-tight">Recent Expenses</h3>
      <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Title</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenses.map((expense, index) => (
              <tr key={expense.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-charcoal whitespace-nowrap">{expense.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-charcoal text-right">{formatCurrency(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;

