"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getActivityFeed, type ActivityFeedItem } from "@/shared/lib/api/feed";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { useRealTime } from "@/shared/context/RealTimeContext";
import ActivityItem from "./ActivityItem";
import Skeleton from "@/shared/components/ui/Skeleton";
import { GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

const RecentActivitiesHub = ({ eventId, className }: { eventId: string; className?: string }) => {
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
    <GlassSectionCard
      className={className}
      title="Recent activity"
      subtitle="Updates from your planning team"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8 text-center">
            <p className={vg.label}>No recent activities</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {items.slice(0, displayCount).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </GlassSectionCard>
  );
};

export default RecentActivitiesHub;
