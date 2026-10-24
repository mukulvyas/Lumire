import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { AssistantWorkspace } from '@/features/assistant/components/AssistantWorkspace';

interface AssistantPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssistantPage({ params }: AssistantPageProps) {
  const { id } = await params;
  const { event, computed, budgetCategories, tasks } = await getEventFullDetails(id);

  return (
    <AssistantWorkspace
      eventId={event.id}
      eventTitle={event.title}
      eventCity={event.city}
      eventDate={event.event_date}
      totalBudget={computed.totalBudget}
      initialCategories={budgetCategories}
      initialTasks={tasks}
    />
  );
}
