// File: src/features/event-planning/components/ChecklistSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTasksForEvent } from '@/lib/api/events';
import { Task } from '@/lib/api/events'; // Import the type
import { CheckSquare, PlusCircle } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import TaskItem from './TaskItem'; // We will create this next
import CreateTaskForm from './CreateTaskForm'; // We will create this next

interface ChecklistSectionProps {
  eventId: string;
}

const ChecklistSection = ({ eventId }: ChecklistSectionProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const data = await getTasksForEvent(token, eventId);
      // Sort tasks to show 'ToDo' items first
      data.sort((a, b) => (a.status === 'Completed' ? 1 : -1) - (b.status === 'Completed' ? 1 : -1));
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = () => {
    setShowCreateForm(false); // Close the form
    fetchTasks();             // Re-fetch the list to show the new task
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="text-primary" size={24} />
          <h2 className="text-2xl font-semibold text-charcoal">Event Checklist</h2>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-cream"
          >
            <PlusCircle size={16} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateTaskForm 
          eventId={eventId} 
          onTaskCreated={handleTaskCreated} 
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {isLoading ? (
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white">
              <LoadingSkeleton className="h-5 w-5 rounded" />
              <div className="flex-grow">
                <LoadingSkeleton className="h-4 w-1/2 mb-2" />
                <LoadingSkeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 && !showCreateForm ? (
        <p className="text-center text-gray-500 py-8">Your checklist is empty. Click &quot;Add Task&quot; to get started!</p>
      ) : (
        <div className="space-y-3 mt-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onStatusChange={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistSection;