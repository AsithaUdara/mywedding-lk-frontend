// File: src/features/event-planning/components/ActivityHub.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getActivityFeed, ActivityFeedItem } from '@/lib/api/events';
import { MessageSquare } from 'lucide-react';
import ActivityItem from './ActivityItem';
import Skeleton from '@/components/ui/Skeleton';

const RecentActivitiesHub = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getActivityFeed(token, eventId);
      // Only show SystemLog items, exclude UserComment
      setItems(data.filter((item: ActivityFeedItem) => item.itemType === 'SystemLog'));
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-primary" size={24} />
        <h2 className="text-2xl font-semibold text-charcoal font-playfair">Recent Activities</h2>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-8 italic font-playfair">No recent activities to show.</p>
        ) : (
          items.map(item => <ActivityItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default RecentActivitiesHub;
