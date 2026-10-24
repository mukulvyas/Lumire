from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import HTMLResponse
from app.api.events import compute_mock_event_details

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.get("/ics")
async def export_ics_endpoint(eventId: str = "00000000-0000-0000-0000-000000000001"):
    details = compute_mock_event_details(eventId)
    event = details["event"]
    run_sheet = details["runSheetItems"]
    event_date_clean = event["event_date"].replace("-", "")

    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Soirée//Celebration Planner//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{event['title']}",
    ]

    if run_sheet:
        for item in run_sheet:
            st = item["start_time"].replace(":", "") + "00"
            et = item["end_time"].replace(":", "") + "00"
            ics_lines.extend([
                "BEGIN:VEVENT",
                f"UID:{item['id']}@soiree.atelier",
                f"DTSTAMP:{event_date_clean}T000000Z",
                f"DTSTART:{event_date_clean}T{st}",
                f"DTEND:{event_date_clean}T{et}",
                f"SUMMARY:{item['title']}",
                f"DESCRIPTION:{item.get('details', '')}",
                f"LOCATION:{event['city']}",
                "STATUS:CONFIRMED",
                "END:VEVENT"
            ])
    else:
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:{event['id']}@soiree.atelier",
            f"DTSTAMP:{event_date_clean}T000000Z",
            f"DTSTART;VALUE=DATE:{event_date_clean}",
            f"SUMMARY:{event['title']}",
            f"DESCRIPTION:Celebration planned with Soirée in {event['city']}",
            f"LOCATION:{event['city']}",
            "STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    ics_lines.append("END:VCALENDAR")
    content = "\r\n".join(ics_lines)

    return Response(
        content=content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="{event["title"].lower().replace(" ", "-")}-schedule.ics"'
        }
    )

@router.get("/pdf", response_class=HTMLResponse)
async def export_pdf_endpoint(eventId: str = "00000000-0000-0000-0000-000000000001"):
    details = compute_mock_event_details(eventId)
    event = details["event"]
    computed = details["computed"]
    categories = details["budgetCategories"]
    tasks = details["tasks"]
    run_sheet = details["runSheetItems"]

    categories_html = "".join(f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{c['name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{int(c['planned']):,}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{int(c['committed']):,}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{c['status']}</td>
        </tr>
    """ for c in categories)

    tasks_html = "".join(f"""
        <div style="margin-bottom: 10px; padding: 10px; background: #fdfaf8; border-radius: 8px;">
            <strong>{t['title']}</strong> — <span style="color: #666;">Due {t['due_date']} ({t['status']})</span>
            {f'<p style="margin-top: 4px; font-size: 13px; color: #5b2a86;">Tip: {t["ai_tip"]}</p>' if t.get('ai_tip') else ''}
        </div>
    """ for t in tasks)

    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{event['title']} — Master Plan</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1d1b18; }}
        h1 {{ color: #430d6e; font-size: 28px; margin-bottom: 8px; }}
        .header {{ border-bottom: 2px solid #5b2a86; padding-bottom: 16px; margin-bottom: 24px; }}
        .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }}
        .card {{ background: #f9f2ed; padding: 16px; border-radius: 8px; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
        th {{ background: #f4ede7; padding: 10px; text-align: left; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{event['title']}</h1>
        <p><strong>Date:</strong> {event['event_date']} &nbsp;|&nbsp; <strong>City:</strong> {event['city']} &nbsp;|&nbsp; <strong>Target Guests:</strong> {event['guest_target']}</p>
    </div>

    <div class="stats">
        <div class="card"><div>Days To Go</div><strong style="font-size: 24px; color: #5b2a86;">{computed['daysToGo']}</strong></div>
        <div class="card"><div>Total Budget</div><strong style="font-size: 24px;">₹{int(computed['totalBudget']):,}</strong></div>
        <div class="card"><div>Committed</div><strong style="font-size: 24px;">₹{int(computed['committedBudget']):,}</strong></div>
        <div class="card"><div>Confirmed Guests</div><strong style="font-size: 24px;">{computed['confirmedGuests']} / {computed['totalGuestsTarget']}</strong></div>
    </div>

    <h2>Budget Allocation</h2>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th style="text-align: right;">Planned</th>
                <th style="text-align: right;">Committed</th>
                <th style="text-align: center;">Status</th>
            </tr>
        </thead>
        <tbody>
            {categories_html}
        </tbody>
    </table>

    <h2>Preparation Milestones</h2>
    {tasks_html}
</body>
</html>"""
