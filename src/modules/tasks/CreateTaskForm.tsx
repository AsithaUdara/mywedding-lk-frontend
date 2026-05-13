"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import { createTask } from '@/shared/lib/api/tasks';

interface CreateTaskFormProps {
  eventId: string;
  onTaskCreated: () => void;
  onCancel: () => void;
}

const CreateTaskForm = ({ eventId, onTaskCreated, onCancel }: CreateTaskFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      await createTask(token, eventId, { title });
      onTaskCreated(); // Notify parent to refresh
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="p-5 bg-cream/60 rounded-xl border-2 border-primary/10 shadow-sm overflow-hidden"
    >
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
          className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-charcoal shadow-sm"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-500 text-xs font-bold pl-1 flex items-center gap-1"
          >
            ! {error}
          </motion.p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-gray-500 rounded-xl hover:bg-black/5 hover:text-charcoal transition-all disabled:opacity-40"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(184, 150, 108, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !title.trim()}
            className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-opacity-90 active:bg-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {loading ? 'Adding Task...' : 'Add Task'}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
};

export default CreateTaskForm;
