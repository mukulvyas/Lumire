import { NextRequest } from 'next/server';
import { getEventFullDetails } from '@/server/db/queries/events';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId') || '00000000-0000-0000-0000-000000000001';

  const { event, runSheetItems } = await getEventFullDetails(eventId);

  // Generate valid iCalendar formatted string (RFC 5545)
  const eventDateClean = event.event_date.replace(/-/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soirée//Celebration Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${event.title}`,
  ];

  if (runSheetItems && runSheetItems.length > 0) {
    for (const item of runSheetItems) {
      const startTimeClean = item.start_time.replace(/:/g, '') + '00';
      const endTimeClean = item.end_time.replace(/:/g, '') + '00';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${item.id}@soiree.atelier`,
        `DTSTAMP:${eventDateClean}T000000Z`,
        `DTSTART:${eventDateClean}T${startTimeClean}`,
        `DTEND:${eventDateClean}T${endTimeClean}`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:${(item.details || '').replace(/\n/g, '\\n')}`,
        `LOCATION:${event.city}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }
  } else {
    // If no run sheet items, create an all-day event for the celebration
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@soiree.atelier`,
      `DTSTAMP:${eventDateClean}T000000Z`,
      `DTSTART;VALUE=DATE:${eventDateClean}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:Celebration planned with Soirée AI Atelier in ${event.city}`,
      `LOCATION:${event.city}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  icsContent.push('END:VCALENDAR');

  return new Response(icsContent.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-schedule.ics"`,
    },
  });
}
