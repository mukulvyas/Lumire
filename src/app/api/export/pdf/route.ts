import { NextRequest } from 'next/server';
import { getEventFullDetails } from '@/server/db/queries/events';
import { formatCurrency, formatLakh } from '@/lib/formatters';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId') || '00000000-0000-0000-0000-000000000001';

  const { event, computed, budgetCategories, tasks, runSheetItems } = await getEventFullDetails(eventId);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${event.title} — Soirée Celebration Architecture</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1d1b18;
      background: #fff;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #5b2a86;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      font-family: 'Newsreader', serif;
      font-size: 24px;
      color: #5b2a86;
      font-weight: bold;
    }
    .title {
      font-family: 'Newsreader', serif;
      font-size: 36px;
      color: #430d6e;
      margin: 10px 0;
    }
    .meta {
      font-size: 14px;
      color: #4c4450;
      display: flex;
      gap: 16px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f9f2ed;
      border: 1px solid #dfd9d4;
      padding: 16px;
      border-radius: 12px;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #4c4450;
    }
    .stat-val {
      font-family: 'Newsreader', serif;
      font-size: 28px;
      color: #430d6e;
      font-weight: bold;
      margin-top: 4px;
    }
    .section-title {
      font-family: 'Newsreader', serif;
      font-size: 22px;
      color: #430d6e;
      margin: 24px 0 12px;
      border-bottom: 1px solid #dfd9d4;
      padding-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f3ede8;
      font-weight: 600;
      color: #430d6e;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #7d7481;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #5b2a86; color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 600; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div class="brand">Soirée AI Atelier</div>
    <h1 class="title">${event.title}</h1>
    <div class="meta">
      <span><strong>Date:</strong> ${event.event_date}</span>
      <span>•</span>
      <span><strong>City:</strong> ${event.city}</span>
      <span>•</span>
      <span><strong>Headcount:</strong> ${event.guest_target} guests</span>
      <span>•</span>
      <span><strong>Budget:</strong> ${formatLakh(computed.totalBudget)}</span>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Countdown</div>
      <div class="stat-val">${computed.daysToGo} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Confirmed Guests</div>
      <div class="stat-val">${computed.confirmedGuests} / ${computed.totalGuestsTarget}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Committed Budget</div>
      <div class="stat-val">${formatLakh(computed.committedBudget)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tasks Done</div>
      <div class="stat-val">${computed.completedTasksCount} / ${computed.totalTasksCount}</div>
    </div>
  </div>

  <h2 class="section-title">Budget Allocation Ledger</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Planned</th>
        <th>Committed</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${budgetCategories
        .map(
          (c) => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${formatCurrency(Number(c.planned), 'INR', 'en-IN')} (${formatLakh(Number(c.planned))})</td>
          <td>${formatCurrency(Number(c.committed), 'INR', 'en-IN')}</td>
          <td>${c.status}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2 class="section-title">Planning Milestones</h2>
  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th>Phase</th>
        <th>Due Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${tasks
        .map(
          (t) => `
        <tr>
          <td><strong>${t.title}</strong>${t.ai_tip ? `<br><small style="color: #5b2a86;">Tip: ${t.ai_tip}</small>` : ''}</td>
          <td>${t.phase}</td>
          <td>${t.due_date}</td>
          <td>${t.status === 'completed' ? '✓ Completed' : 'Pending'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  ${
    runSheetItems && runSheetItems.length > 0
      ? `
  <h2 class="section-title">Day-of Celebration Run Sheet</h2>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Event Segment</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${runSheetItems
        .map(
          (r) => `
        <tr>
          <td><strong>${r.start_time} - ${r.end_time}</strong></td>
          <td><strong>${r.title}</strong></td>
          <td>${r.details || '—'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  `
      : ''
  }

  <div class="footer">
    <span>Generated by Soirée AI Atelier</span>
    <span>Deterministic Budget Engine • Regional Benchmark Grounding</span>
  </div>

  <script>
    // Auto prompt print dialog if requested
    if (window.location.search.includes('print=true')) {
      window.print();
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
