// File: src/features/event-planning/components/EventSetupModal.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
// FIX: Rename import to avoid conflict with setTotalBudget state setter
import { setTotalBudget as setTotalBudgetAPI } from '@/lib/api/events';
import { Wallet } from 'lucide-react';

interface EventSetupModalProps {
  isOpen: boolean;
  onClose: () => void; // This will also trigger a data refresh
  eventId: string;
  eventName: string;
}

const EventSetupModal = ({ isOpen, onClose, eventId, eventName }: EventSetupModalProps) => {
  const { user } = useAuth();
  const [totalBudget, setTotalBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debug log
  console.log('🎨 EventSetupModal render:', { isOpen, eventId, eventName });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const budgetAmount = parseFloat(totalBudget);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      console.log('🎯 Setting budget for event:', eventId, 'Amount:', budgetAmount);

      await setTotalBudgetAPI(token, eventId, budgetAmount);

      console.log('✅ Budget set successfully!');
      onClose(); // Close the modal and trigger refresh in the parent component

    } catch (err) {
      console.error('❌ Failed to set budget:', err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // We use a high z-index to ensure it appears on top of everything
    // PREVENT closing on backdrop click - user must complete this step
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm modal-container"
      onClick={(e) => e.stopPropagation()}>
      <div className="relative w-full max-w-lg p-8 rounded-xl shadow-2xl bg-cream">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-3xl font-bold font-playfair text-charcoal">Welcome to &quot;{eventName}&quot;!</h2>
          <p className="mt-2 text-gray-600">Let&apos;s start with the basics. What is your total estimated budget?</p>
        </div>

        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-center mt-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="totalBudget" className="block text-sm font-medium text-charcoal mb-2">Total Budget (LKR)</label>
            <input
              id="totalBudget"
              type="number"
              placeholder="e.g., 5000000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              required
              className="w-full text-center text-xl font-bold py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? 'Saving...' : 'Set Budget & Start Planning'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventSetupModal;
