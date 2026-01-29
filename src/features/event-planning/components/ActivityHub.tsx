// File: src/features/event-planning/components/ActivityHub.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getActivityFeed, ActivityFeedItem } from '@/lib/api/events';
import { MessageSquare } from 'lucide-react';
import ActivityItem from './ActivityItem';
import PostCommentForm from './PostCommentForm';
import Skeleton from '@/components/ui/Skeleton';

const ActivityHub = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getActivityFeed(token, eventId);
      setItems(data);
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
        <h2 className="text-2xl font-semibold text-charcoal">Activity & Comments</h2>
      </div>
      
      <PostCommentForm eventId={eventId} onCommentPosted={fetchActivity} />

      <div className="mt-6 space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No activity yet. Start a conversation or complete a task!</p>
        ) : (
          items.map(item => <ActivityItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default ActivityHub;
