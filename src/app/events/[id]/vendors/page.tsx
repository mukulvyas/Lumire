import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { VendorKanbanManager } from '@/features/vendors/components/VendorKanbanManager';

interface VendorsPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorsPage({ params }: VendorsPageProps) {
  const { id } = await params;
  const { event, computed, vendors } = await getEventFullDetails(id);

  return (
    <VendorKanbanManager
      eventId={event.id}
      eventTitle={event.title}
      eventCity={event.city}
      daysToGo={computed.daysToGo}
      totalBudget={computed.totalBudget}
      initialVendors={vendors}
    />
  );
}
