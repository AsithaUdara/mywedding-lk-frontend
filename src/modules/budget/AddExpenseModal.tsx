"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { addExpense, getBudgetCategories, type BudgetCategory } from "@/shared/lib/api/budget";
import { postComment } from "@/shared/lib/api/feed";
import { X, ChevronDown } from "lucide-react";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { pv } from "@/modules/vendors/public-theme";
import { cn } from "@/shared/lib/cn";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onExpenseAdded: () => void;
}

const AddExpenseModal = ({ isOpen, onClose, eventId, onExpenseAdded }: AddExpenseModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open-blur");
    } else {
      document.body.classList.remove("modal-open-blur");
    }
    return () => {
      document.body.classList.remove("modal-open-blur");
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      const fetchCategories = async () => {
        try {
          const token = await user.getIdToken();
          const fetchedCategories = await getBudgetCategories(token);
          setCategories(fetchedCategories);
          if (fetchedCategories.length > 0) {
            setCategoryId(fetchedCategories[0].id);
          }
        } catch {
          setError("Could not load categories.");
        }
      };
      void fetchCategories();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
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

      try {
        await postComment(token, eventId, `Added a new expense: "${title}" for LKR ${amount}`);
      } catch (feedError) {
        console.error("Failed to post to activity feed", feedError);
      }

      onExpenseAdded();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(pv.modalOverlay, "modal-container")} onClick={onClose}>
      <div className={pv.modalPanel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="mb-6 text-center font-playfair text-2xl font-bold text-foreground sm:text-3xl">
          Add a new expense
        </h2>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="expenseTitle" className={cn("mb-1.5 block", pv.label)}>
              Expense title
            </label>
            <input
              id="expenseTitle"
              type="text"
              placeholder="e.g., Caterer advance payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="expenseAmount" className={cn("mb-1.5 block", pv.label)}>
                Amount (LKR)
              </label>
              <input
                id="expenseAmount"
                type="number"
                placeholder="e.g., 75000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="expenseDate" className={cn("mb-1.5 block", pv.label)}>
                Date
              </label>
              <input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="budgetCategory" className={cn("mb-1.5 block", pv.label)}>
              Category
            </label>
            <div className="relative">
              <select
                id="budgetCategory"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className={cn(inputClass, "appearance-none pr-10")}
              >
                {categories.length === 0 && <option>Loading categories…</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Adding…" : "Add expense"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
