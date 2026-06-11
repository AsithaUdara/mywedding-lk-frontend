"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getActivityFeed, type ActivityFeedItem } from "@/shared/lib/api/feed";
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

  const RECENT_ACTIVITY_LIMIT = 3;

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const activityData = await getActivityFeed(token, eventId).catch(() => []);
      setItems(activityData.filter((item: ActivityFeedItem) => item.itemType === "SystemLog"));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity, activityVersion, checklistVersion]);

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
            {items.slice(0, RECENT_ACTIVITY_LIMIT).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </GlassSectionCard>
  );
};

export default RecentActivitiesHub;
