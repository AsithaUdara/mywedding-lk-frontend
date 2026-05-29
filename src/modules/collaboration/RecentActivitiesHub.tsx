"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getActivityFeed, type ActivityFeedItem } from "@/shared/lib/api/feed";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { MessageSquare } from "lucide-react";
import ActivityItem from "./ActivityItem";
import Skeleton from "@/shared/components/ui/Skeleton";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

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
        getTasksForEvent(token, eventId).catch(() => []),
      ]);

      setItems(activityData.filter((item: ActivityFeedItem) => item.itemType === "SystemLog"));

      const pendingCount = (tasksData as { status: string }[]).filter(
        (t) => t.status !== "Completed"
      ).length;
      setPendingTasksCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void fetchActivityAndTasks();
  }, [fetchActivityAndTasks, activityVersion, checklistVersion]);

  const tasksShown = Math.min(pendingTasksCount, 7);
  const displayCount = Math.max(4, 3 + tasksShown);

  return (
    <div className={cn(cp.panel, "flex h-full flex-col md:p-8")}>
      <div className="mb-6 flex flex-shrink-0 items-center gap-4 border-b border-border pb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="text-primary" size={20} strokeWidth={1.5} aria-hidden />
        </div>
        <h2 className={cp.sectionTitle}>Recent activity</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className={cp.label}>No recent activities</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {items.slice(0, displayCount).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivitiesHub;
