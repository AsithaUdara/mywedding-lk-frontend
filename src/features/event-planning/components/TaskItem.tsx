"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { type Task, updateTaskStatus } from '@/lib/api/tasks';
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
    <div className={`group flex flex-col gap-2 p-4 rounded-xl border transition-all duration-300 bg-white ${isCompleted ? 'border-gray-100 shadow-sm opacity-75' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20'}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={handleCheckboxChange}
          disabled={isUpdating}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
            isCompleted 
              ? 'bg-primary border-primary scale-95' 
              : 'border-gray-300 hover:border-primary bg-white group-hover:scale-105'
          } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isCompleted && <Check size={14} strokeWidth={3} className="text-white" />}
        </button>

        <div className="flex-grow">
          <p className={`text-[15px] font-medium transition-all duration-300 ${isCompleted ? 'line-through text-gray-400' : 'text-charcoal'}`}>
            {task.title}
          </p>
        </div>

        <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full transition-colors ${
          isCompleted 
            ? 'bg-gray-100 text-gray-500' 
            : 'bg-primary/5 text-primary'
        }`}>
          {task.status}
        </span>
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500 font-medium pl-10 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default TaskItem;