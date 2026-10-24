import React from 'react';
import { getEventFullDetails } from '@/server/db/queries/events';
import { PlanHeader } from '@/features/plan/components/PlanHeader';
import { StatCardsGrid } from '@/features/plan/components/StatCardsGrid';
import { NextStepsSection } from '@/features/plan/components/NextStepsSection';
import { BudgetDonutCard } from '@/features/plan/components/BudgetDonutCard';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventOverviewPage({ params }: EventPageProps) {
  const { id } = await params;
  const eventData = await getEventFullDetails(id);

  const { event, computed, budgetCategories, tasks } = eventData;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Architectural Ambient Glow Layers */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col pb-32">
        {/* Header Module */}
        <PlanHeader
          eventId={event.id}
          title={event.title}
          type={event.type}
          eventDate={event.event_date}
          city={event.city}
          guestTarget={event.guest_target}
          totalBudget={computed.totalBudget}
        />

        {/* Section 1: Top Metrics Grid (4 Cards) */}
        <StatCardsGrid
          daysToGo={computed.daysToGo}
          confirmedGuests={computed.confirmedGuests}
          totalGuestsTarget={computed.totalGuestsTarget}
          committedBudget={computed.committedBudget}
          totalBudget={computed.totalBudget}
          completedTasksCount={computed.completedTasksCount}
          totalTasksCount={computed.totalTasksCount}
        />

        {/* Section 2: Two Column Content (Next Steps & Budget at a Glance) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <NextStepsSection eventId={event.id} initialTasks={tasks} />
          </div>

          <div className="lg:col-span-5">
            <BudgetDonutCard
              eventId={event.id}
              totalBudget={computed.totalBudget}
              committedBudget={computed.committedBudget}
              categories={budgetCategories}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
