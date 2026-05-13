import React from 'react';
import ChecklistSection from '@/modules/tasks/ChecklistSection';

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <ChecklistSection eventId={eventId} />
    </div>
  );
}
