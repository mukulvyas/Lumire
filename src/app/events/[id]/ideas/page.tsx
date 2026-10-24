import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { IdeasGrid } from '@/features/ideas/components/IdeasGrid';

interface IdeasPageProps {
  params: Promise<{ id: string }>;
}

export default async function IdeasPage({ params }: IdeasPageProps) {
  const { id } = await params;
  const { event, computed, ideas } = await getEventFullDetails(id);

  return (
    <IdeasGrid
      eventId={event.id}
      eventTitle={event.title}
      eventCity={event.city}
      totalBudget={computed.totalBudget}
      initialIdeas={ideas}
    />
  );
}
