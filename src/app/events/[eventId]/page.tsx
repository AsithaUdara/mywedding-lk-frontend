import React from 'react';
import MiniChecklist from '@/modules/tasks/MiniChecklist';
import MiniBudget from '@/modules/budget/MiniBudget';
import RecentActivitiesHub from '@/modules/collaboration/RecentActivitiesHub';
import { MiniVendorProposals } from '@/modules/procurement/MiniVendorProposals';

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
      {/* Primary Column - 8/12 span */}
      <div className="lg:col-span-8 space-y-6">
        <MiniChecklist eventId={eventId} />
        <MiniBudget eventId={eventId} />
      </div>

      {/* Sidebar Column - 4/12 span */}
      <div className="lg:col-span-4 flex h-full min-h-0 flex-col gap-6">
        <MiniVendorProposals eventId={eventId} />
        <RecentActivitiesHub eventId={eventId} />
      </div>
    </div>
  );
}