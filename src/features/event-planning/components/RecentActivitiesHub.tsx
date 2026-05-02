"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getActivityFeed, type ActivityFeedItem } from '@/lib/api/feed';
import { getTasksForEvent } from '@/lib/api/tasks';
import { useRealTime } from '@/context/RealTimeContext';
import { MessageSquare } from 'lucide-react';
import ActivityItem from './ActivityItem';
import Skeleton from '@/components/ui/Skeleton';

const RecentActivitiesHub = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { activityVersion, checklistVersion } = useRealTime();
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);

  const fetchActivityAndTasks = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      
      const [activityData, tasksData] = await Promise.all([
        getActivityFeed(token, eventId).catch(() => []),
        getTasksForEvent(token, eventId).catch(() => [])
      ]);

      setItems(activityData.filter((item: ActivityFeedItem) => item.itemType === 'SystemLog'));
      
      const pendingCount = tasksData.filter((t: any) => t.status !== 'Completed').length;
      setPendingTasksCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchActivityAndTasks();
  }, [fetchActivityAndTasks, activityVersion, checklistVersion]);

  // MiniChecklist shows up to 7 tasks.
  // 0 tasks = 4 activities
  // 1 task = 4 activities matches height.
  // 7 tasks = 10 activities perfectly matches height.
  const tasksShown = Math.min(pendingTasksCount, 7);
  const displayCount = Math.max(4, 3 + tasksShown);

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-white/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="text-primary" size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-playfair text-charcoal tracking-tight">Recent Activities</h2>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">No recent activities</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {items.slice(0, displayCount).map(item => <ActivityItem key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivitiesHub;
