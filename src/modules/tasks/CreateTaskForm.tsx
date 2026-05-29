"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import { createTask } from '@/shared/lib/api/tasks';
import { postComment } from '@/shared/lib/api/feed';
import { Button, inputClass } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

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
      
      // Auto-trigger activity feed
      try {
        await postComment(token, eventId, `Added a new task: "${title}"`);
      } catch (feedError) {
        console.error("Failed to post to activity feed", feedError);
      }
      
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
      className="overflow-hidden rounded-xl border-2 border-primary/10 bg-primary/5 p-5 shadow-sm"
    >
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
          className={cn(inputClass, "font-medium shadow-sm")}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 pl-1 text-xs font-bold text-destructive"
          >
            ! {error}
          </motion.p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !title.trim()}>
            {loading ? "Adding task…" : "Add task"}
          </Button>
        </div>
      </div>
    </motion.form>
  );
};

export default CreateTaskForm;
