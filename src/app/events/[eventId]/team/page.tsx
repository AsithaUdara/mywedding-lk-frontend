import React from 'react';
import TeamSection from '@/modules/collaboration/TeamSection';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <TeamSection eventId={eventId} />
    </div>
  );
}
