import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { GuestListManager } from '@/features/guests/components/GuestListManager';

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const { id } = await params;
  const { event, guests } = await getEventFullDetails(id);

  return (
    <GuestListManager
      eventId={event.id}
      eventTitle={event.title}
      eventDate={event.event_date}
      guestTarget={event.guest_target}
      initialGuests={guests}
    />
  );
}
