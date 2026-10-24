'use client';

import React, { useState } from 'react';
import { tasks, runSheetItems } from '@/server/db/schema';
import { calculateDaysToGo } from '@/lib/formatters';
import { Calendar, Clock, Check, Lightbulb, CalendarPlus } from 'lucide-react';

interface TimelineViewProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  initialTasks: (typeof tasks.$inferSelect)[];
  runSheet: (typeof runSheetItems.$inferSelect)[];
}

export function TimelineView({
  eventId,
  eventTitle,
  eventDate,
  initialTasks,
  runSheet,
}: TimelineViewProps) {
  const [activeTab, setActiveTab] = useState<'milestones' | 'runsheet'>('milestones');
  const [taskList, setTaskList] = useState(initialTasks);

  // Group tasks by phase
  const phases = Array.from(new Set(taskList.map((t) => t.phase || 'General Milestones')));

  async function handleToggleTask(taskId: string) {
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

  const completedCount = taskList.filter((t) => t.status === 'completed').length;

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-primary/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold px-3 py-1 rounded-full bg-primary-fixed/50 inline-block mb-3">
            Timeline & Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary">
            {eventTitle}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1.5 flex items-center gap-2">
            <span>{completedCount} of {taskList.length} milestones completed</span>
            <span>•</span>
            <span>Target date: {new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>

        {/* Export Calendar Action */}
        <div className="flex items-center gap-3">
          <a
            href={`/api/export/ics?eventId=${eventId}`}
            download={`${eventTitle.toLowerCase().replace(/\s+/g, '-')}-schedule.ics`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-surface-container-lowest text-primary font-sans text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md hover:bg-surface-container-low transition-all border border-primary/15"
          >
            <CalendarPlus className="w-4 h-4 text-primary" />
            <span>Export Calendar (.ics)</span>
          </a>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center justify-center my-8">
        <div className="inline-flex p-1.5 rounded-full bg-surface-container-low border border-primary/15 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-sans text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Planning Milestones</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('runsheet')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-sans text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'runsheet'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Day-of Run Sheet</span>
          </button>
        </div>
      </div>

      {/* View 1: Planning Milestones grouped by Phase */}
      {activeTab === 'milestones' && (
        <div className="space-y-10">
          {phases.map((phaseName) => {
            const phaseTasks = taskList.filter((t) => (t.phase || 'General Milestones') === phaseName);

            return (
              <div
                key={phaseName}
                className="bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-primary/10 shadow-sm"
              >
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-primary/10">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    {phaseName}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                    {phaseTasks.filter((t) => t.status === 'completed').length} / {phaseTasks.length} done
                  </span>
                </div>

                <div className="space-y-6">
                  {phaseTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    const daysAway = calculateDaysToGo(task.due_date);
                    const formattedDate = new Date(task.due_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <div key={task.id} className="flex items-start gap-4">
                        {/* Toggle Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`mt-1 shrink-0 w-6 h-6 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                            isDone
                              ? 'bg-primary border-primary text-on-primary shadow-xs'
                              : 'bg-surface-container border-primary/20 hover:border-primary text-transparent'
                          }`}
                          aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                        </button>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3
                              className={`font-sans text-sm sm:text-base font-semibold transition-colors ${
                                isDone
                                  ? 'line-through text-on-surface-variant/70'
                                  : 'text-on-surface'
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span className="text-xs text-on-surface-variant shrink-0">
                              {isDone ? (
                                <span className="text-success font-medium">Completed</span>
                              ) : (
                                <span>Due in {daysAway} days • {formattedDate}</span>
                              )}
                            </span>
                          </div>

                          {task.ai_tip && (
                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-container-low text-primary text-xs leading-relaxed border border-primary/5">
                              <Lightbulb className="w-3.5 h-3.5 text-tertiary-container shrink-0 mt-0.5" />
                              <span>AI Tip: {task.ai_tip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Day-of Run Sheet */}
      {activeTab === 'runsheet' && (
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-primary/10 shadow-sm space-y-8">
          <div className="pb-4 border-b border-primary/10 flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
              Celebration Day Schedule
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">
              Synchronized with vendor call times
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 space-y-8">
            {runSheet.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border-4 border-primary shadow-xs" />

                <div className="bg-surface-container-low/70 rounded-2xl p-4 sm:p-5 border border-primary/10 transition-all hover:bg-surface-container-low">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-primary bg-primary-fixed/40 px-2.5 py-0.5 rounded-full inline-block w-fit">
                      {item.start_time} - {item.end_time}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      Run sheet item
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-on-surface mb-1">
                    {item.title}
                  </h3>
                  {item.details && (
                    <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
