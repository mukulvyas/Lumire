export interface NavItem {
  label: string;
  href: (eventId: string) => string;
  segment: string;
}

export const EVENT_NAV_ITEMS: NavItem[] = [
  { label: 'Plan', href: (id) => `/events/${id}`, segment: '' },
  { label: 'Budget', href: (id) => `/events/${id}/budget`, segment: 'budget' },
  { label: 'Guests', href: (id) => `/events/${id}/guests`, segment: 'guests' },
  { label: 'Vendors', href: (id) => `/events/${id}/vendors`, segment: 'vendors' },
  { label: 'Ideas', href: (id) => `/events/[id]/ideas`.replace('[id]', id), segment: 'ideas' },
];
