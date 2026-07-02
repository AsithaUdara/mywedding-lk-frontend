"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { addExpense, getBudgetCategories, type BudgetCategory } from "@/shared/lib/api/budget";
import { postComment } from "@/shared/lib/api/feed";
import { X, ChevronDown } from "lucide-react";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

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
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
      onClick={onClose}
    >
      <div
        className={cn(rf.panel, "relative w-full max-w-lg overflow-hidden p-6 sm:p-8")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(rf.navBtn, "absolute right-3 top-3")}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 id="add-expense-title" className={cn(rf.sectionTitle, "mb-6 pr-8 text-center")}>
          Add a new expense
        </h2>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="expenseTitle" className={cn("mb-1.5 block", rf.label)}>
              Expense title
            </label>
            <input
              id="expenseTitle"
              type="text"
              placeholder="e.g., Caterer advance payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={glassInput}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="expenseAmount" className={cn("mb-1.5 block", rf.label)}>
                Amount (LKR)
              </label>
              <input
                id="expenseAmount"
                type="number"
                placeholder="e.g., 75000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={glassInput}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="expenseDate" className={cn("mb-1.5 block", rf.label)}>
                Date
              </label>
              <input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
                className={glassInput}
              />
            </div>
          </div>
          <div>
            <label htmlFor="budgetCategory" className={cn("mb-1.5 block", rf.label)}>
              Category
            </label>
            <div className="relative">
              <select
                id="budgetCategory"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className={cn(glassInput, "appearance-none pr-10")}
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

          <GlassButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Adding…" : "Add expense"}
          </GlassButton>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
