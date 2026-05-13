"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getTasksForEvent, type Task } from '@/shared/lib/api/tasks';
import { useRealTime } from '@/shared/context/RealTimeContext';
import { CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import TaskItem from './TaskItem';
import Skeleton from '@/shared/components/ui/Skeleton';

const MiniChecklist = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { checklistVersion } = useRealTime();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getTasksForEvent(token, eventId);
      // Only get pending tasks, take top 7 so the dashboard can grow with user input
      const pendingTasks = data.filter(t => t.status !== 'Completed').slice(0, 7);
      setTasks(pendingTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, checklistVersion]);

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/60">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckSquare className="text-primary" size={16} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold font-playfair text-charcoal tracking-tight">Next Tasks</h2>
        </div>
        <Link 
          href={`/events/${eventId}/checklist`}
          className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 hover:text-primary/70 transition-colors"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : tasks.length === 0 ? (
          <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500 font-medium">No pending tasks!</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem key={task.id} task={task} onStatusChange={fetchTasks} />
          ))
        )}
      </div>
    </div>
  );
};

export default MiniChecklist;

