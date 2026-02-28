"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Task, updateTaskStatus } from '@/lib/api/events';
import { Check } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onStatusChange: () => void;
}

const TaskItem = ({ task, onStatusChange }: TaskItemProps) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckboxChange = async () => {
    if (!user || isUpdating) return;
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const newStatus = task.status === 'Completed' ? 'ToDo' : 'Completed';
      await updateTaskStatus(token, task.id, newStatus);
      onStatusChange();
    } catch (error) {
      console.error('Failed to update task status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to update task right now. Please try again.';
      setErrorMessage(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={handleCheckboxChange}
          disabled={isUpdating}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${isCompleted ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'
            } ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isCompleted && <Check size={16} className="text-white" />}
        </button>

        <div className="flex-grow">
          <p className={`font-medium text-charcoal transition-colors ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </p>
        </div>

        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}>
          {task.status}
        </span>
      </div>
      {errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default TaskItem;