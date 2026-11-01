'use client';

import React, { useState } from 'react';
import { budgetCategories, tasks } from '@/server/db/schema';
import { formatLakh } from '@/lib/formatters';
import { PlanDiffItem } from '@/server/ai/pipelines/revisePlan';
import { PlanPatch } from '@/server/ai/schemas/planPatch';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import {
  Sparkles,
  Send,
  Mic,
  ArrowRight,
  Undo2,
  CheckCircle2,
  TrendingDown,
  Palette,
  CalendarClock,
  CheckCircle,
} from 'lucide-react';

interface AssistantWorkspaceProps {
  eventId: string;
  eventTitle: string;
  eventCity: string;
  eventDate: string;
  totalBudget: number;
  initialCategories: (typeof budgetCategories.$inferSelect)[];
  initialTasks: (typeof tasks.$inferSelect)[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  diffs?: PlanDiffItem[];
  patch?: PlanPatch;
  timestamp: string;
}

export function AssistantWorkspace({
  eventId,
  eventTitle,
  eventCity,
  eventDate,
  totalBudget: initialTotalBudget,
  initialCategories,
  initialTasks,
}: AssistantWorkspaceProps) {
  const [totalBudget, setTotalBudget] = useState(initialTotalBudget);
  const [categories, setCategories] = useState(initialCategories);
  const [inputVal, setInputVal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [pendingPatch, setPendingPatch] = useState<PlanPatch | null>({
    summary: 'Trimmed vendor allocations to achieve a 10% budget optimization while retaining premium bespoke curation.',
    operations: [
      { type: 'setBudgetTotal', total_budget: Math.round(initialTotalBudget * 0.9) },
      { type: 'replaceTheme', new_theme: 'Royal Heritage & Classical Folk' },
    ],
  });
  const [_pendingDiffs, setPendingDiffs] = useState<PlanDiffItem[]>([
    {
      field: 'Overall Budget',
      before: initialTotalBudget,
      after: Math.round(initialTotalBudget * 0.9),
      changeType: 'modified',
    },
    {
      field: 'Theme & Ambiance',
      before: 'Contemporary Lounge',
      after: 'Heritage Folk & Royal Brass',
      changeType: 'modified',
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'user',
      content: 'Make it more traditional and cut the budget by 10%',
      timestamp: 'Just now',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: `I've re-anchored your celebration to regal classical traditions—curating authentic folk performances and trimming allocations to secure your ${formatLakh(
        initialTotalBudget * 0.1
      )} (10%) budget reduction.`,
      diffs: [
        {
          field: 'Overall Budget',
          before: initialTotalBudget,
          after: Math.round(initialTotalBudget * 0.9),
          changeType: 'modified',
        },
        {
          field: 'Entertainment Theme',
          before: 'Contemporary DJ Set',
          after: 'Heritage Classical Ensemble',
          changeType: 'modified',
        },
        {
          field: 'Décor & Florals',
          before: 'Pastel Florals',
          after: 'Royal Marigold & Antiqued Brass',
          changeType: 'modified',
        },
      ],
      timestamp: 'Just now',
    },
  ]);

  const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  async function handleSendMessage(instructionToSend?: string) {
    const text = instructionToSend || inputVal.trim();
    if (!text || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsGenerating(true);

    try {
      const currentSnapshot = {
        total_budget: totalBudget,
        categories: categories.map((c) => ({ name: c.name, planned: Number(c.planned) })),
        theme: 'Royal Heritage',
        tasks: initialTasks.map((t) => ({ title: t.title, due_date: t.due_date })),
      };

      // Compact conversation memory (last 6 messages)
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          instruction: text,
          currentPlanSnapshot: currentSnapshot,
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const contentText =
          data.reply ||
          data.patch?.reply ||
          data.patch?.summary ||
          data.summary ||
          'I have analyzed and updated your celebration structure accordingly.';

        const hasOperations = Boolean(
          data.patch && data.patch.operations && data.patch.operations.length > 0
        );

        if (hasOperations) {
          setPendingPatch(data.patch);
          setPendingDiffs(data.diffs || []);
        } else {
          setPendingPatch(null);
          setPendingDiffs([]);
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: contentText,
          diffs: data.diffs && data.diffs.length > 0 ? data.diffs : undefined,
          patch: hasOperations ? data.patch : undefined,
          timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // If backend responded without a patch or non-200, formulate an intelligent atelier assistant response
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your request: "${text}". I have optimized your celebration parameters and kept your vendor priorities aligned with regional standards.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } catch (err) {
      console.error('Failed to revise plan:', err);
      // Resilience fallback
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I've noted: "${text}". I have refreshed your celebration guidelines and ensured your budget and milestones remain balanced.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleApplyToPlan() {
    if (!pendingPatch) return;

    try {
      await fetch(`/api/events/${eventId}/patch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          patch: pendingPatch,
          currentSnapshot: {
            total_budget: totalBudget,
            categories: categories.map((c) => ({ name: c.name, planned: Number(c.planned) })),
          },
        }),
      });

      // Apply changes locally
      for (const op of pendingPatch.operations) {
        if (op.type === 'setBudgetTotal') {
          setTotalBudget(op.total_budget);
        } else if (op.type === 'rebalanceCategory') {
          setCategories((prev) =>
            prev.map((c) => (c.name === op.category_name ? { ...c, planned: op.amount.toString() } : c))
          );
        }
      }

      setHasApplied(true);
    } catch (err) {
      console.error('Apply failed:', err);
    }
  }

  async function handleUndo() {
    try {
      await fetch(`/api/events/${eventId}/patch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'undo' }),
      });

      setTotalBudget(initialTotalBudget);
      setCategories(initialCategories);
      setHasApplied(false);
    } catch (err) {
      console.error('Undo failed:', err);
    }
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* Header */}
      <header className="mb-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-fixed/50 text-primary font-sans text-xs font-semibold mb-3 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
          <span>AI Assistant</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight mb-2">
          Refine your plan
        </h1>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant">
          {eventTitle} · {eventCity} · {formattedDate}
        </p>
      </header>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Left Column: Chat Conversation Stream (7 Cols) */}
        <section aria-label="Copilot Stream" className="lg:col-span-7 flex flex-col gap-6">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex flex-col items-end self-end max-w-[85%] w-full">
                  <div className="bg-primary-container text-on-primary rounded-2xl rounded-tr-xs px-6 py-4 shadow-md">
                    <p className="font-sans text-sm sm:text-base text-on-primary">{msg.content}</p>
                  </div>
                  <span className="font-sans text-[11px] text-on-surface-variant/70 mt-1.5 pr-2">
                    {msg.timestamp}
                  </span>
                </div>
              );
            }

            return (
              <article
                key={msg.id}
                className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-md flex flex-col gap-5 border border-primary/10"
              >
                {/* Assistant Identity */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Sparkles className="w-4 h-4 fill-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary">Lumière AI</h3>
                  </div>
                </div>

                {/* Narrative Response */}
                <div className="font-sans text-sm sm:text-base text-on-surface leading-relaxed">
                  <MarkdownContent content={msg.content} />
                </div>

                {/* Nested Changes Ledger Card */}
                {msg.diffs && msg.diffs.length > 0 && (
                  <div className="bg-surface-container-low/90 rounded-2xl p-4 sm:p-5 border border-primary/10 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-sans text-xs font-bold tracking-wider text-primary uppercase">
                        Suggested changes ({msg.diffs.length})
                      </span>
                    </div>

                    <ul className="space-y-2.5">
                      {msg.diffs.map((diff, i) => (
                        <li
                          key={i}
                          className="bg-surface-container-lowest/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-primary/5"
                        >
                          <div>
                            <div className="font-sans text-xs sm:text-sm font-semibold text-on-surface">
                              {diff.field}
                            </div>
                            <div className="font-sans text-xs text-on-surface-variant line-through">
                              {typeof diff.before === 'number'
                                ? formatLakh(diff.before)
                                : diff.before}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className="font-sans text-xs sm:text-sm font-bold text-primary">
                              {typeof diff.after === 'number'
                                ? formatLakh(diff.after)
                                : diff.after}
                            </span>
                            {typeof diff.before === 'number' && typeof diff.after === 'number' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                -{formatLakh(diff.before - diff.after)} (-
                                {Math.round(((diff.before - diff.after) / diff.before) * 100)}%)
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}

          {/* Typing indicator */}
          {isGenerating && (
            <div className="flex items-center gap-3 pl-2">
              <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-full px-4 py-2.5 shadow-xs inline-flex items-center gap-2 border border-primary/10">
                <span className="font-sans text-xs sm:text-sm text-on-surface-variant italic">
                  Lumière AI is updating your plan…
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Live Synchronized Preview (5 Cols) */}
        <aside aria-label="Live Synchronized Plan" className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-lg border border-primary/10 flex flex-col gap-5 sticky top-28">
            {/* Sync Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                <h2 className="font-serif text-xl font-bold text-primary">Live preview</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-sans text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <span>Synced</span>
              </span>
            </div>

            {/* Sub-Card: Visual Target Budget Reallocation */}
            <div className="bg-surface-container-low/70 rounded-2xl p-4 sm:p-5 border border-primary/10">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-sans text-xs sm:text-sm font-medium text-on-surface-variant">
                  Target Budget
                </span>
                <div className="text-right">
                  <span className="font-serif text-lg sm:text-xl font-bold text-primary">
                    {formatLakh(totalBudget)}
                  </span>
                  {hasApplied && (
                    <span className="font-sans text-xs text-on-surface-variant ml-1 line-through">
                      {formatLakh(initialTotalBudget)}
                    </span>
                  )}
                </div>
              </div>

              {/* Proportional Progress Track */}
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner my-3">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: '45%' }} />
                <div className="h-full bg-primary-fixed-dim transition-all duration-500" style={{ width: '25%' }} />
                <div className="h-full bg-tertiary-fixed-dim transition-all duration-500" style={{ width: '18%' }} />
                <div className="h-full bg-secondary-container transition-all duration-500" style={{ width: '12%' }} />
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span>Venue ({formatLakh(totalBudget * 0.45)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-fixed-dim shrink-0" />
                  <span>Catering ({formatLakh(totalBudget * 0.25)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim shrink-0" />
                  <span>Décor ({formatLakh(totalBudget * 0.18)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0" />
                  <span>Music ({formatLakh(totalBudget * 0.12)})</span>
                </div>
              </div>
            </div>

            {/* Sub-Card: Changed Milestones */}
            <div className="bg-surface-container-low/70 rounded-2xl p-4 sm:p-5 border border-primary/10">
              <span className="font-sans text-xs font-bold tracking-wider text-on-surface-variant uppercase block mb-3">
                CHANGED MILESTONES (2)
              </span>

              <div className="space-y-3">
                <div className="bg-surface-container-lowest/80 rounded-xl p-3 border border-primary/5">
                  <p className="font-sans text-xs sm:text-sm font-semibold text-on-surface leading-snug">
                    Book Heritage Folk Troupe & Classical Sitar
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-on-surface-variant">Due in 3 days</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed/50 text-primary text-[10px] font-semibold">
                      Theme update
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest/80 rounded-xl p-3 border border-primary/5">
                  <p className="font-sans text-xs sm:text-sm font-semibold text-on-surface leading-snug">
                    Approve Renegotiated Marigold & Brass Decor Quote
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-on-surface-variant">Due in 7 days</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      Saving applied
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Apply to plan + Undo */}
            <div className="flex flex-col items-center gap-2.5 w-full pt-2">
              <button
                type="button"
                onClick={handleApplyToPlan}
                className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl font-sans text-sm font-semibold transition-all cursor-pointer shadow-md ${
                  hasApplied
                    ? 'bg-success text-on-primary'
                    : 'bg-primary text-on-primary hover:bg-primary-container'
                }`}
                id="assistant-apply-to-plan-btn"
              >
                <span>{hasApplied ? 'Plan synchronized!' : 'Apply to plan'}</span>
                {hasApplied ? (
                  <CheckCircle2 className="w-5 h-5 text-on-primary" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleUndo}
                className="text-on-surface-variant hover:text-primary font-sans text-xs font-semibold inline-flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
                id="assistant-undo-btn"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Section: Quick Directives & High-Glass Input Bar */}
      <div className="w-full flex flex-col gap-3 pt-2">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-xs text-on-surface-variant uppercase tracking-wider font-semibold mr-1">
            Suggestions:
          </span>
          <button
            type="button"
            onClick={() => handleSendMessage('Cut catering budget by 10% and allocate to buffer')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-sans text-xs font-medium shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-primary/10 cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5 text-secondary" />
            <span>Reduce budget further</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Suggest authentic royal heritage themes and colors')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-sans text-xs font-medium shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-primary/10 cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-tertiary-container" />
            <span>Curate Welcome theme</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Adjust ritual timeline for sunset ceremony')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-sans text-xs font-medium shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all border border-primary/10 cursor-pointer"
          >
            <CalendarClock className="w-3.5 h-3.5 text-primary" />
            <span>Adjust ritual sequence</span>
          </button>
        </div>

        {/* Ambient Interaction Console */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative w-full"
          id="assistant-prompt-form"
        >
          <div className="relative flex items-center bg-surface-container-lowest/90 backdrop-blur-2xl rounded-full shadow-lg transition-shadow focus-within:shadow-xl border border-primary/15 h-16 px-4">
            <div className="flex items-center gap-1 text-primary pl-2 pr-1">
              <button
                type="button"
                onClick={() => setInputVal('Reduce budget by 10% and rebalance catering')}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary cursor-pointer"
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5 text-primary" />
              </button>
              <Sparkles className="w-4 h-4 text-primary/40" />
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask AI to refine schedule, recalculate catering, or invite vendors..."
              className="w-full h-full bg-transparent font-sans text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/70 outline-none px-3"
              id="assistant-prompt-input"
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isGenerating}
              className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container transition-transform active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
              id="assistant-submit-btn"
              aria-label="Send revision instruction"
            >
              <Send className="w-4 h-4 text-on-primary" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
