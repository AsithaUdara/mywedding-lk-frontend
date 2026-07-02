import React from 'react';
import MiniBudget from '@/modules/budget/MiniBudget';
import RecentActivitiesHub from '@/modules/collaboration/RecentActivitiesHub';
import { EventHomeOverviewRow } from '@/modules/events/EventHomeOverviewRow';
import { eventWorkspace } from '@/modules/events/event-workspace';
import { cn } from '@/shared/lib/cn';

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className={eventWorkspace.pageEnter}>
      <div className={eventWorkspace.homeOverviewGrid}>
        <EventHomeOverviewRow eventId={eventId} />
        <MiniBudget
          eventId={eventId}
          className={cn(eventWorkspace.homeOverviewBudget, eventWorkspace.homeOverviewCard)}
        />
        <RecentActivitiesHub
          eventId={eventId}
          className={cn(eventWorkspace.homeOverviewActivity, eventWorkspace.homeOverviewCard)}
        />
      </div>
    </div>
  );
}
