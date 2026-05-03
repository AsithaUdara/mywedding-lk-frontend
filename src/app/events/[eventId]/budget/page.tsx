import React from 'react';
import BudgetSection from '@/features/event-planning/components/BudgetSection';

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <BudgetSection eventId={eventId} />
    </div>
  );
}
