import React from 'react';
import MiniChecklist from '@/modules/tasks/MiniChecklist';
import MiniBudget from '@/modules/budget/MiniBudget';
import RecentActivitiesHub from '@/modules/collaboration/RecentActivitiesHub';
import { MiniVendorProposals } from '@/modules/procurement/MiniVendorProposals';
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
        <MiniChecklist
          eventId={eventId}
          className={cn(eventWorkspace.homeOverviewTasks, eventWorkspace.homeOverviewCard)}
        />
        <MiniVendorProposals
          eventId={eventId}
          className={cn(eventWorkspace.homeOverviewVendors, eventWorkspace.homeOverviewCard)}
        />
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
