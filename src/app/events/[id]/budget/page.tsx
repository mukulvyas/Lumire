import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { BudgetOverview } from '@/features/budget/components/BudgetOverview';

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { id } = await params;
  const { event, computed, budgetCategories } = await getEventFullDetails(id);

  return (
    <BudgetOverview
      eventId={event.id}
      eventTitle={event.title}
      eventCity={event.city}
      eventDate={event.event_date}
      totalBudget={computed.totalBudget}
      initialCategories={budgetCategories}
    />
  );
}
