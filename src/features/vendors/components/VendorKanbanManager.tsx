'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { vendors } from '@/server/db/schema';
import { formatCurrency, formatLakh } from '@/lib/formatters';
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  Sparkles,
  X,
  Check,
  Hourglass,
} from 'lucide-react';

interface VendorKanbanManagerProps {
  eventId: string;
  eventTitle: string;
  eventCity: string;
  daysToGo: number;
  totalBudget: number;
  initialVendors: (typeof vendors.$inferSelect)[];
}

const KANBAN_STAGES = [
  { id: 'contacted', label: 'Contacted', color: 'bg-outline' },
  { id: 'quoted', label: 'Quoted', color: 'bg-primary' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-tertiary-container' },
  { id: 'paid', label: 'Paid', color: 'bg-secondary' },
] as const;

export function VendorKanbanManager({
  eventId: _eventId,
  eventTitle,
  eventCity,
  daysToGo,
  totalBudget,
  initialVendors,
}: VendorKanbanManagerProps) {
  const [vendorList, setVendorList] = useState(initialVendors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<(typeof vendors.$inferSelect) | null>(null);
  const [questions, setQuestions] = useState<{ question: string; priority: string; answered?: boolean }[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // New Vendor Form
  const [newVendorName, setNewVendorName] = useState('');
  const [newCategory, setNewCategory] = useState('Decor');
  const [newQuote, setNewQuote] = useState(150000);
  const [newPhone, setNewPhone] = useState('+91 98000 00000');
  const [newNote, setNewNote] = useState('');

  const totalCommitted = vendorList.reduce((sum, v) => sum + Number(v.quote_amount), 0);

  const filteredVendors = vendorList.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
  });

  async function handleOpenDrawer(vendor: typeof vendors.$inferSelect) {
    setSelectedVendor(vendor);
    setIsLoadingQuestions(true);

    try {
      const res = await fetch('/api/ai/vendor-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: vendor.name,
          category: vendor.category,
          budgetEstimate: Number(vendor.quote_amount),
          city: eventCity,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      } else {
        setQuestions([
          { question: 'Does your quote include setup, teardown, and delivery fees?', priority: 'critical' },
          { question: 'What is the deposit requirement and payment milestone schedule?', priority: 'high' },
          { question: 'Can you provide proof of vendor insurance and contingency coverage?', priority: 'standard' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setQuestions([
        { question: 'Does your quote include setup, teardown, and delivery fees?', priority: 'critical' },
        { question: 'What is the deposit requirement and payment milestone schedule?', priority: 'high' },
      ]);
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  async function handleStatusChange(vendorId: string, newStatus: string) {
    setVendorList((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v))
    );

    try {
      await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn('Vendor status update offline sync:', err);
    }
  }

  async function handleAddVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const tempId = `v-${Date.now()}`;
    const newV: typeof vendors.$inferSelect = {
      id: tempId,
      event_id: _eventId,
      name: newVendorName.trim(),
      category: newCategory,
      status: 'contacted',
      quote_amount: newQuote.toString(),
      note: newNote || 'Initial discovery inquiry',
      contact: { phone: newPhone },
      created_at: new Date(),
    };

    setVendorList((prev) => [...prev, newV]);
    setNewVendorName('');
    setShowAddModal(false);

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: _eventId,
          name: newV.name,
          category: newV.category,
          status: newV.status,
          quote_amount: Number(newV.quote_amount),
          note: newV.note,
          contact: newV.contact,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vendor?.id) {
          setVendorList((prev) =>
            prev.map((v) => (v.id === tempId ? { ...v, id: data.vendor.id } : v))
          );
        }
      }
    } catch (err) {
      console.warn('Vendor creation offline sync:', err);
    }
  }

  function toggleQuestionAnswer(index: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, answered: !q.answered } : q))
    );
  }

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-8 pb-32">
      {/* Top Context Subheader */}
      <header className="pt-4 pb-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              {eventTitle}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-sans text-xs text-primary font-semibold flex items-center gap-1.5 bg-primary-fixed/50 px-3 py-0.5 rounded-full">
              <Hourglass className="w-3.5 h-3.5 text-primary" />
              {daysToGo} days to go
            </span>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <span className="font-sans text-xs text-on-surface-variant hidden sm:inline">
              {eventCity}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-lowest shadow-xs rounded-full px-4 py-1.5 border border-primary/10">
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <span className="text-on-surface-variant uppercase font-semibold">Committed</span>
              <span className="text-primary font-bold">{formatLakh(totalCommitted)}</span>
              <span className="text-outline-variant">of</span>
              <span className="text-on-surface-variant font-medium">{formatLakh(totalBudget)}</span>
            </div>
          </div>
        </div>

        {/* Title & Search / Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center mb-2">
              <span className="bg-primary-fixed text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Vendors
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
              Your vendors
            </h1>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant mt-1 max-w-2xl">
              Track quotes, contracts, and bookings in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 text-on-surface-variant w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors or discipline..."
                className="h-11 pl-10 pr-4 rounded-full bg-surface-container-lowest text-on-surface font-sans text-xs sm:text-sm placeholder:text-outline border border-primary/10 shadow-xs focus:outline-none focus:border-primary w-60 sm:w-68"
                id="vendors-search-input"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (filteredVendors.length > 0) {
                  handleOpenDrawer(filteredVendors[0]);
                }
              }}
              className="h-11 px-4 rounded-full bg-primary/10 text-primary border border-primary/20 font-sans text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
              id="vendors-ai-copilot-btn"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>AI Vendor Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="h-11 px-5 rounded-full bg-primary text-on-primary font-sans text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md hover:bg-primary-container transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              id="vendors-add-vendor-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add vendor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {KANBAN_STAGES.map((col) => {
          const colVendors = filteredVendors.filter((v) => v.status === col.id);

          return (
            <div key={col.id} className="flex flex-col gap-3.5">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className="font-sans text-sm font-bold text-on-surface">{col.label}</span>
                </div>
                <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-sans text-xs font-bold text-on-surface-variant">
                  {colVendors.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3.5 min-h-[300px] p-1.5 rounded-2xl bg-surface-container-low/40 border border-primary/5">
                {colVendors.map((vendor) => {
                  const phone = (vendor.contact as { phone?: string })?.phone || '+91 98000 00000';
                  const quoteAmountNum = Number(vendor.quote_amount);

                  return (
                    <div
                      key={vendor.id}
                      onClick={() => handleOpenDrawer(vendor)}
                      className="group bg-surface-container-lowest rounded-2xl p-5 border border-primary/10 shadow-xs hover:shadow-md transition-all flex flex-col gap-3 relative cursor-pointer hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-serif text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {vendor.name}
                          </h3>
                          <p className="font-sans text-xs text-on-surface-variant mt-0.5 truncate">
                            {vendor.note || 'No notes added'}
                          </p>
                        </div>
                        <span className="bg-surface-container text-on-surface-variant font-sans text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                          {vendor.category}
                        </span>
                      </div>

                      {/* Quote Amount */}
                      <div className="flex flex-col gap-0.5 pt-1">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-outline font-semibold">
                          Quote amount
                        </span>
                        <span className="font-serif text-lg font-bold text-primary">
                          {formatCurrency(quoteAmountNum, 'INR', 'en-IN')}
                        </span>
                      </div>

                      {/* AI Negotiation Copilot Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(vendor);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-on-primary font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-primary/20 shadow-2xs group-hover:border-primary"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>AI Negotiation Questions</span>
                      </button>

                      {/* Card Footer: Call & WhatsApp & Stage Dropdown */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t border-surface-container"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${phone}`}
                            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors"
                            title={`Call ${vendor.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed transition-colors"
                            title={`WhatsApp ${vendor.name}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Stage Selector */}
                        <select
                          value={vendor.status}
                          onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                          className="text-[11px] font-semibold text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-full border-none outline-none cursor-pointer"
                        >
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Questions Drawer */}
      {mounted && selectedVendor && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setSelectedVendor(null)}
          />

          <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-surface-container-lowest shadow-2xl z-50 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex flex-col gap-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-primary/10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Questions to ask
                    </span>
                    <span className="bg-primary-fixed text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary fill-primary" />
                      <span>AI Curated</span>
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-primary leading-tight">
                    {selectedVendor.name}
                  </h2>
                  <span className="font-sans text-xs text-on-surface-variant">
                    {selectedVendor.category} • {formatCurrency(Number(selectedVendor.quote_amount), 'INR', 'en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVendor(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Before approving or finalizing the quote for{' '}
                <strong className="text-on-surface">{selectedVendor.name}</strong>, review these key points:
              </p>

              {/* Checklist */}
              {isLoadingQuestions ? (
                <div className="py-8 text-center text-on-surface-variant text-xs">
                  <Sparkles className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                  Generating tailored discovery questions...
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {questions.map((q, idx) => (
                    <label
                      key={idx}
                      className="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors cursor-pointer border border-primary/5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestionAnswer(idx)}
                        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                          q.answered
                            ? 'bg-success border-success text-on-primary'
                            : 'bg-surface-container border-primary/20 hover:border-primary text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-sans text-xs sm:text-sm font-medium leading-snug ${
                            q.answered ? 'line-through text-on-surface-variant/70' : 'text-on-surface'
                          }`}
                        >
                          {q.question}
                        </span>
                        <span className="font-sans text-[11px] text-primary font-semibold mt-1 capitalize">
                          {q.priority} priority
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="mt-6 pt-4 border-t border-primary/10 flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-primary-fixed/40 border border-primary/10 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-primary leading-snug">
                  AI Tip: Booking vendors 3 months ahead locks peak-season rates and protects against last-minute surcharges.
                </p>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hi ${selectedVendor.name}, reviewing our ${selectedVendor.category} quote for ${eventTitle}. Could you confirm terms regarding setup timelines and backup contingency plans?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 px-4 rounded-full bg-primary-container text-on-primary font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share questions on WhatsApp</span>
              </a>
            </div>
          </aside>
        </>,
        document.body
      )}

      {/* Add Vendor Modal */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 max-w-md w-full border border-primary/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-2xl font-bold text-primary">Add New Vendor</h3>

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Vendor / Business Name
                </label>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. Royal Heritage Caterers"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                  id="add-vendor-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Discipline / Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Décor</option>
                    <option value="Photography">Photography</option>
                    <option value="Music">Music</option>
                    <option value="Gifts">Gifts</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Quote Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={newQuote}
                    onChange={(e) => setNewQuote(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Deliverables / Scope Note
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Includes acoustic trio and 4-hour performance"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-primary/15 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container cursor-pointer"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
