'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { tasks } from '@/server/db/schema';
import { calculateDaysToGo } from '@/lib/formatters';
import { Check, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';

interface NextStepsSectionProps {
  eventId: string;
  initialTasks: (typeof tasks.$inferSelect)[];
}

export function NextStepsSection({ eventId, initialTasks }: NextStepsSectionProps) {
  const [taskList, setTaskList] = useState(initialTasks);

  // Filter top 3 incomplete tasks or show top 3
  const activeTasks = taskList
    .filter((t) => t.status !== 'completed')
    .slice(0, 3);

  // If all completed, show recent 3
  const displayedTasks = activeTasks.length > 0 ? activeTasks : taskList.slice(0, 3);

  async function toggleTask(taskId: string) {
    const target = taskList.find((t) => t.id === taskId);
    if (!target) return;

    const newStatus = target.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between px-1">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Next steps</h2>
        <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Chronological Flow
        </span>
      </div>

      {/* Main Glassmorphic Container */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 shadow-[0_8px_32px_-4px_rgba(91,42,134,0.06)] border border-primary/5 flex flex-col space-y-7">
        {displayedTasks.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">All celebration milestones are up to date!</p>
          </div>
        ) : (
          displayedTasks.map((task, index) => {
            const isDone = task.status === 'completed';
            const daysAway = calculateDaysToGo(task.due_date);
            const dateFormatted = new Date(task.due_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <React.Fragment key={task.id}>
                {index > 0 && <div className="h-px w-full bg-surface-container" />}

                <div className="group flex items-start gap-4">
                  {/* Interactive Completion Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 shrink-0 w-6 h-6 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                      isDone
                        ? 'bg-primary border-primary text-on-primary shadow-xs'
                        : 'bg-surface-container border-primary/20 hover:border-primary text-transparent'
                    }`}
                    aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 space-y-2">
                    <h3
                      className={`font-sans text-base sm:text-lg font-semibold transition-colors ${
                        isDone
                          ? 'line-through text-on-surface-variant/70'
                          : 'text-on-surface group-hover:text-primary'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Due Date Indicator */}
                    <p className="font-sans text-xs text-on-surface-variant font-medium">
                      {isDone ? (
                        <span className="text-success font-semibold">Completed</span>
                      ) : daysAway === 0 ? (
                        <span className="text-secondary font-semibold">Due today</span>
                      ) : (
                        <span>Due in {daysAway} days</span>
                      )}{' '}
                      <span className="text-outline-variant">•</span> {dateFormatted}
                    </p>

                    {/* AI Tip Pill */}
                    {task.ai_tip && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low text-primary text-xs sm:text-sm font-sans leading-relaxed border border-primary/5">
                        <Lightbulb className="w-4 h-4 text-tertiary-container shrink-0 mt-0.5" />
                        <span>AI Tip: {task.ai_tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* View Full Timeline Link */}
        <div className="pt-2 border-t border-surface-container">
          <Link
            href={`/events/${eventId}/timeline`}
            className="inline-flex items-center gap-2 font-sans text-sm text-primary-container font-semibold hover:gap-3 transition-all"
            id="plan-view-full-timeline-link"
          >
            <span>View full timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
