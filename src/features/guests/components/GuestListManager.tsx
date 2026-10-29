'use client';

import React, { useState } from 'react';
import { guests } from '@/server/db/schema';
import {
  Search,
  Plus,
  Send,
  Users,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface GuestListManagerProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  guestTarget: number;
  initialGuests: (typeof guests.$inferSelect)[];
}

const AVATAR_BG_COLORS = [
  'bg-primary-fixed text-primary',
  'bg-surface-container-high text-primary',
  'bg-secondary-fixed text-secondary',
  'bg-tertiary-fixed text-tertiary',
];

export function GuestListManager({
  eventId: _eventId,
  eventTitle,
  eventDate,
  guestTarget,
  initialGuests,
}: GuestListManagerProps) {
  const [guestList, setGuestList] = useState(initialGuests);
  const [filter, setFilter] = useState<'all' | 'attending' | 'pending' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newPartySize, setNewPartySize] = useState(1);
  const [newRelation, setNewRelation] = useState('Friend');
  const [newDietary, setNewDietary] = useState('None');
  const [copiedLink, setCopiedLink] = useState(false);

  // Computed counts
  const confirmedCount = guestList.filter((g) => g.rsvp === 'attending').reduce((acc, g) => acc + (g.party_size || 1), 0);
  const pendingCount = guestList.filter((g) => g.rsvp === 'pending').reduce((acc, g) => acc + (g.party_size || 1), 0);
  const declinedCount = guestList.filter((g) => g.rsvp === 'declined').reduce((acc, g) => acc + (g.party_size || 1), 0);

  const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Filtered list
  const filteredGuests = guestList.filter((g) => {
    if (filter !== 'all' && g.rsvp !== filter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.relation && g.relation.toLowerCase().includes(q)) ||
      (g.dietary && g.dietary.toLowerCase().includes(q))
    );
  });

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const tempId = `g-${Date.now()}`;
    const newGuest: typeof guests.$inferSelect = {
      id: tempId,
      event_id: _eventId,
      name: newGuestName.trim(),
      party_size: newPartySize,
      relation: newRelation,
      dietary: newDietary,
      rsvp: 'attending',
      table_id: null,
      created_at: new Date(),
    };

    setGuestList((prev) => [newGuest, ...prev]);
    setNewGuestName('');
    setShowAddModal(false);

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: _eventId,
          name: newGuest.name,
          party_size: newGuest.party_size,
          relation: newGuest.relation,
          dietary: newGuest.dietary,
          rsvp: newGuest.rsvp,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.guest?.id) {
          setGuestList((prev) =>
            prev.map((g) => (g.id === tempId ? { ...g, id: data.guest.id } : g))
          );
        }
      }
    } catch (err) {
      console.warn('Guest creation offline sync:', err);
    }
  }

  function handleWhatsAppInvite() {
    const inviteText = encodeURIComponent(
      `Hello! You're warmly invited to celebrate with us at ${eventTitle} on ${formattedDate}. Please let us know your RSVP and dietary preferences!`
    );
    window.open(`https://wa.me/?text=${inviteText}`, '_blank');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  async function toggleGuestRsvp(guestId: string) {
    let nextRsvp = 'attending';
    setGuestList((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        nextRsvp = g.rsvp === 'attending' ? 'pending' : g.rsvp === 'pending' ? 'declined' : 'attending';
        return { ...g, rsvp: nextRsvp };
      })
    );

    try {
      await fetch(`/api/guests/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp: nextRsvp }),
      });
    } catch (err) {
      console.warn('Guest RSVP offline sync:', err);
    }
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* Header */}
      <header className="flex flex-col gap-2 mb-8">
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed/60 border border-primary/15 text-primary font-sans text-xs uppercase tracking-wider font-semibold">
            Guest List
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
              Guest list
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1.5">
              {confirmedCount} of {guestTarget} guests confirmed{' '}
              <span className="mx-1.5 text-outline-variant">·</span> {formattedDate}
            </p>
          </div>

          {/* Status Filter Chips */}
          <div aria-label="Filter guests by status" className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter(filter === 'attending' ? 'all' : 'attending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                filter === 'attending'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest/90 text-on-surface-variant hover:text-primary border border-primary/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{confirmedCount} Confirmed</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                filter === 'pending'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest/90 text-on-surface-variant hover:text-primary border border-primary/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{pendingCount} Pending</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'declined' ? 'all' : 'declined')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                filter === 'declined'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest/90 text-on-surface-variant hover:text-primary border border-primary/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-outline" />
              <span>{declinedCount} Declined</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search & Action Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest name, dietary, or table..."
            className="w-full h-12 pl-11 pr-5 rounded-full bg-surface-container-lowest border border-primary/15 text-on-surface placeholder:text-on-surface-variant/60 font-sans text-sm focus:outline-none focus:border-primary shadow-xs transition-all"
            id="guests-search-input"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-12 px-5 rounded-full border border-primary bg-transparent text-primary hover:bg-primary/5 font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="guests-add-guest-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add guest</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppInvite}
            className="h-12 px-6 rounded-full bg-primary-container text-on-primary font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-primary active:scale-95 transition-all cursor-pointer"
            id="guests-whatsapp-invite-btn"
          >
            <Send className="w-4 h-4" />
            <span>{copiedLink ? 'WhatsApp Opened!' : 'Invite via WhatsApp'}</span>
          </button>
        </div>
      </section>

      {/* Workspace Grid (Guest List Rows + Seating Plan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Guest List Rows (8 Columns) */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          {filteredGuests.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest/80 rounded-2xl border border-primary/10">
              <Users className="w-8 h-8 text-on-surface-variant mx-auto mb-2" />
              <p className="font-sans text-sm text-on-surface-variant">No guests found matching your criteria.</p>
            </div>
          ) : (
            filteredGuests.map((guest, idx) => {
              const initials = guest.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const avatarColor = AVATAR_BG_COLORS[idx % AVATAR_BG_COLORS.length];

              const isAttending = guest.rsvp === 'attending';
              const isPending = guest.rsvp === 'pending';

              return (
                <article
                  key={guest.id}
                  className="bg-surface-container-lowest/90 border border-primary/10 rounded-2xl p-4 sm:px-6 sm:py-4 shadow-xs hover:shadow-md hover:border-primary/25 transition-all flex items-center justify-between gap-4 min-h-[72px]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0 ${avatarColor}`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-sans text-sm sm:text-base font-semibold text-on-surface truncate">
                        {guest.name}
                      </h2>
                      <p className="font-sans text-xs text-on-surface-variant truncate mt-0.5">
                        {guest.party_size && guest.party_size > 1 ? `Party of ${guest.party_size}` : 'Solo'}{' '}
                        <span className="mx-1">·</span> {guest.relation || 'Guest'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {guest.dietary && guest.dietary !== 'None' && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container font-sans text-xs text-on-surface-variant">
                        <UtensilsCrossed className="w-3 h-3 text-primary" />
                        {guest.dietary}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleGuestRsvp(guest.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-semibold cursor-pointer transition-all ${
                        isAttending
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      title="Click to toggle RSVP status"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAttending ? 'bg-success' : isPending ? 'bg-amber-500' : 'bg-outline'
                        }`}
                      />
                      <span className="capitalize">{guest.rsvp}</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Right Panel: Seating Plan & AI Tip (4 Columns) */}
        <aside className="lg:col-span-4 sticky top-28 flex flex-col gap-5">
          <div className="bg-surface-container-lowest/90 border border-primary/10 backdrop-blur-xl rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            {/* Panel Header */}
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl font-bold text-primary tracking-tight">
                Seating plan
              </h2>
              <div className="flex items-center justify-between text-xs text-on-surface-variant mt-1 font-sans">
                <span>16 of 18 tables full · 89%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-primary rounded-full" style={{ width: '89%' }} />
              </div>
            </div>

            {/* Visual Round Table Cards */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low/70 border border-primary/10">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed/60 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-on-surface truncate">
                      Royal Marigold
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">8/8 seats filled</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-sans text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Full
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low/70 border border-primary/10">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-on-surface truncate">
                      Saffron Terrace
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">6/8 seats filled</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-sans text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  2 open seats
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low/70 border border-primary/10">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-on-surface truncate">
                      Lotus Courtyard
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">5/8 seats filled</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-sans text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  3 open seats
                </span>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1 cursor-pointer"
              >
                <span>Open interactive seating chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Tip Card */}
            <div className="p-4 rounded-2xl bg-primary-fixed/40 border border-primary/10 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-primary leading-relaxed">
                AI tip: Seat guests with similar dietary restrictions together at Table 1 so the kitchen catering team can serve them effortlessly.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 max-w-md w-full border border-primary/15 shadow-2xl space-y-5">
            <h3 className="font-serif text-2xl font-bold text-primary">Add New Guest</h3>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Meera Joshi"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                  id="add-guest-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newPartySize}
                    onChange={(e) => setNewPartySize(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Relation
                  </label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                  >
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Dietary Note
                </label>
                <input
                  type="text"
                  value={newDietary}
                  onChange={(e) => setNewDietary(e.target.value)}
                  placeholder="e.g. Vegetarian, Jain, Vegan, None"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
