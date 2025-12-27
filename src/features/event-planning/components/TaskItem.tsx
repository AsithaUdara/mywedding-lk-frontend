// File: src/features/event-planning/components/TaskItem.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Task, updateTaskStatus } from '@/lib/api/events';
import { CheckCircle, Clock, ListChecks } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onStatusChange: () => void; // callback to refresh parent list
}

const statusMeta: Record<Task['status'], { label: string; icon: React.ReactNode; color: string }> = {
  ToDo: { label: 'To Do', icon: <ListChecks size={16} />, color: 'text-gray-600' },
  InProgress: { label: 'In Progress', icon: <Clock size={16} />, color: 'text-amber-600' },
  Completed: { label: 'Completed', icon: <CheckCircle size={16} />, color: 'text-green-600' },
};

const TaskItem = ({ task, onStatusChange }: TaskItemProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: Task['status']) => {
    if (!user || loading || newStatus === status) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      await updateTaskStatus(token, task.id, newStatus);
      setStatus(newStatus);
      onStatusChange();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
      <div className="flex items-start gap-3">
        <span className={`mt-1 ${statusMeta[status].color}`}>{statusMeta[status].icon}</span>
        <div>
          <p className="font-semibold text-charcoal">{task.title}</p>
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(['ToDo', 'InProgress', 'Completed'] as Task['status'][]).map((s) => (
          <button
            key={s}
            disabled={loading}
            onClick={() => handleStatusUpdate(s)}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
              status === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {statusMeta[s].label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskItem;
