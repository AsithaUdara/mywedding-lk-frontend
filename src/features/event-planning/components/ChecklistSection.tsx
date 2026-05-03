"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTasksForEvent, type Task } from '@/lib/api/tasks';
import { useRealTime } from '@/context/RealTimeContext';
import { CheckSquare, PlusCircle } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import TaskItem from './TaskItem'; // We will create this next
import CreateTaskForm from './CreateTaskForm'; // We will create this next

interface ChecklistSectionProps {
  eventId: string;
}

const ChecklistSection = ({ eventId }: ChecklistSectionProps) => {
  const { user } = useAuth();
  const { checklistVersion } = useRealTime();
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
  }, [fetchTasks, checklistVersion]);

  const handleTaskCreated = () => {
    setShowCreateForm(false);
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-white/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="text-primary" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-playfair text-charcoal tracking-tight">Event Checklist</h2>
            <div className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
              <span>{completedCount} of {tasks.length} tasks completed</span>
              {tasks.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {progressPercentage}%
                </span>
              )}
            </div>
          </div>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-primary transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            <PlusCircle size={18} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <CreateTaskForm
            eventId={eventId}
            onTaskCreated={handleTaskCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50">
              <LoadingSkeleton className="h-6 w-6 rounded-full flex-shrink-0" />
              <div className="flex-grow">
                <LoadingSkeleton className="h-4 w-1/3 mb-2" />
                <LoadingSkeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 && !showCreateForm ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckSquare className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-charcoal mb-2">No tasks yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first task to start organizing your perfect wedding.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary bg-primary/10 transition-colors duration-200 hover:bg-primary/20"
          >
            <PlusCircle size={18} />
            <span>Add your first task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onStatusChange={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistSection;