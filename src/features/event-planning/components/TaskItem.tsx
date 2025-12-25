// File: src/features/event-planning/components/TaskItem.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateTaskStatus } from '@/lib/api/events';
import { Task } from '@/lib/api/events';

interface TaskItemProps {
  task: Task;
  onStatusChange: () => void; // Function to tell the parent to refresh
}

const TaskItem = ({ task, onStatusChange }: TaskItemProps) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckboxChange = async () => {
    if (!user || isUpdating) return;
    setIsUpdating(true);

    try {
      const token = await user.getIdToken();
      const newStatus = task.status === 'Completed' ? 'ToDo' : 'Completed';
      await updateTaskStatus(token, task.id, newStatus);
      onStatusChange(); // Tell parent to refresh the list
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Optionally show an error to the user
    } finally {
      setIsUpdating(false);
    }
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${isCompleted ? 'bg-green-50' : 'bg-white hover:bg-cream/50'}`}>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleCheckboxChange}
        disabled={isUpdating}
        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
      />
      <div className="flex-grow">
        <p className={`font-medium text-charcoal transition-colors ${isCompleted ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
      </div>
    </div>
  );
};

export default TaskItem;