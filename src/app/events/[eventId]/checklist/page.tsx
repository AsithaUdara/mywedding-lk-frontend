import React from 'react';
import ChecklistSection from '@/modules/tasks/ChecklistSection';
import { eventWorkspace } from '@/modules/events/event-workspace';

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className={eventWorkspace.pageEnter}>
      <ChecklistSection eventId={eventId} />
    </div>
  );
}
