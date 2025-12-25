// File: src/features/event-planning/components/CreateTaskForm.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createTask } from '@/lib/api/events';

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
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-6 bg-cream rounded-lg border border-gray-200">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a new task title..."
        required
        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default CreateTaskForm;