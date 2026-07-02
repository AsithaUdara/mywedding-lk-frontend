import React from 'react';
import TeamSection from '@/modules/collaboration/TeamSection';
import { eventWorkspace } from '@/modules/events/event-workspace';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className={eventWorkspace.pageEnter}>
      <TeamSection eventId={eventId} />
    </div>
  );
}
