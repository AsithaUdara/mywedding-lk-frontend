"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getTasksForEvent, type Task } from '@/shared/lib/api/tasks';
import { useRealTime } from '@/shared/context/RealTimeContext';
import { CheckSquare, PlusCircle } from 'lucide-react';
import LoadingSkeleton from '@/shared/components/ui/LoadingSkeleton';
import TaskItem from './TaskItem'; // We will create this next
import CreateTaskForm from './CreateTaskForm'; // We will create this next
import { Button } from '@/shared/components/ui';

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
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CheckSquare className="text-primary" size={24} strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <h2 className="font-playfair text-2xl font-bold tracking-tight text-foreground">
              My tasks
            </h2>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>
                {completedCount} of {tasks.length} tasks completed
              </span>
              {tasks.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                  {progressPercentage}%
                </span>
              )}
            </div>
          </div>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} variant="primary" className="gap-2">
            <PlusCircle size={18} aria-hidden />
            <span>Add task</span>
          </Button>
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
            <div key={i} className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
              <LoadingSkeleton className="h-6 w-6 rounded-full flex-shrink-0" />
              <div className="flex-grow">
                <LoadingSkeleton className="h-4 w-1/3 mb-2" />
                <LoadingSkeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 && !showCreateForm ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm">
            <CheckSquare className="text-muted-foreground" size={24} aria-hidden />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No tasks yet</h3>
          <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
            Create your first task to start organizing your perfect wedding.
          </p>
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
            <TaskItem key={task.id} task={task} eventId={eventId} onStatusChange={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistSection;
