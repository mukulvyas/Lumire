import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { TimelineView } from '@/features/timeline/components/TimelineView';

interface TimelinePageProps {
  params: Promise<{ id: string }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { id } = await params;
  const { event, tasks, runSheetItems } = await getEventFullDetails(id);

  return (
    <TimelineView
      eventId={event.id}
      eventTitle={event.title}
      eventDate={event.event_date}
      initialTasks={tasks}
      runSheet={runSheetItems}
    />
  );
}
