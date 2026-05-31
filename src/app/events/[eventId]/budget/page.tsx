import React from 'react';
import BudgetSection from '@/modules/budget/BudgetSection';
import { eventWorkspace } from '@/modules/events/event-workspace';

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className={eventWorkspace.pageEnter}>
      <BudgetSection eventId={eventId} />
    </div>
  );
}
