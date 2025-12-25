// File: src/features/event-planning/components/AddExpenseModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addExpense, getBudgetCategories, BudgetCategory } from '@/lib/api/events';
import { X, ChevronDown } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onExpenseAdded: () => void;
}

const AddExpenseModal = ({ isOpen, onClose, eventId, onExpenseAdded }: AddExpenseModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [categoryId, setCategoryId] = useState('');
  
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories when the modal opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchCategories = async () => {
        try {
          const token = await user.getIdToken();
          const fetchedCategories = await getBudgetCategories(token);
          setCategories(fetchedCategories);
          // Set a default category if available
          if (fetchedCategories.length > 0) {
            setCategoryId(fetchedCategories[0].id);
          }
        } catch (err) {
          console.error("Failed to fetch budget categories", err);
          setError("Could not load categories.");
        }
      };
      fetchCategories();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to add an expense.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      await addExpense(token, eventId, {
        title,
        amount: parseFloat(amount),
        expenseDate,
        budgetCategoryId: categoryId,
      });
      
      onExpenseAdded(); // Notify parent to refresh

    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg p-8 rounded-xl shadow-2xl bg-cream" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors"><X size={24} /></button>
        <h2 className="text-3xl font-bold font-playfair text-charcoal text-center mb-6">Add a New Expense</h2>
        
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="expenseTitle" className="block text-sm font-medium text-charcoal mb-2">Expense Title</label>
            <input
              id="expenseTitle"
              type="text"
              placeholder="e.g., Caterer Advance Payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
                <label htmlFor="expenseAmount" className="block text-sm font-medium text-charcoal mb-2">Amount (LKR)</label>
                <input
                    id="expenseAmount"
                    type="number"
                    placeholder="e.g., 75000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
            </div>
            <div className="w-1/2">
                <label htmlFor="expenseDate" className="block text-sm font-medium text-charcoal mb-2">Date of Expense</label>
                <input
                    id="expenseDate"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
            </div>
          </div>
          <div>
            <label htmlFor="budgetCategory" className="block text-sm font-medium text-charcoal mb-2">Category</label>
            <div className="relative">
                <select
                    id="budgetCategory"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full appearance-none py-3 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                >
                    {categories.length === 0 && <option>Loading categories...</option>}
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full mt-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
