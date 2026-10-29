import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Soirée Python Backend"

@pytest.mark.asyncio
async def test_ai_intake_pipeline():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/ai/intake", json={"userInput": "150-guest wedding in Jaipur, ₹15 lakh, February"})
        assert res.status_code == 200
        data = res.json()
        assert data["type"] == "wedding"
        assert data["guest_target"] == 150
        assert data["total_budget"] == 1500000.0

@pytest.mark.asyncio
async def test_events_get_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/events/00000000-0000-0000-0000-000000000001")
        assert res.status_code == 200
        data = res.json()
        assert "event" in data
        assert "computed" in data
        assert data["computed"]["daysToGo"] > 0
        assert len(data["budgetCategories"]) >= 5

@pytest.mark.asyncio
async def test_vendor_questions_pipeline():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/ai/vendor-questions", json={
            "vendorName": "Taj Jai Mahal",
            "category": "Venue & Stay",
            "budgetEstimate": 650000.0,
            "city": "Jaipur"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["questions"]) >= 2

@pytest.mark.asyncio
async def test_ai_intake_with_prompt():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/ai/intake", json={"prompt": "150-guest wedding in February"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "brief" in data
        assert data["brief"]["type"] == "wedding"

@pytest.mark.asyncio
async def test_ai_generate_sse_stream():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/ai/generate", json={
            "brief": {
                "title": "Royal Wedding",
                "type": "wedding",
                "event_date": "2027-02-14",
                "city": "Jaipur",
                "region_code": "IN-RJ",
                "guest_target": 150,
                "total_budget": 1500000.0,
                "currency": "INR",
                "locale": "en-IN"
            }
        })
        assert res.status_code == 200
        text = res.text
        assert "data: " in text
        assert "Celebration plan finalized!" in text

@pytest.mark.asyncio
async def test_ai_revise_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/ai/revise", json={
            "instruction": "Cut budget by 10%",
            "currentPlanSnapshot": {
                "total_budget": 1500000.0,
                "categories": [{"name": "Venue & Stay", "planned": 675000.0}]
            }
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "patch" in data
        assert "diffs" in data

@pytest.mark.asyncio
async def test_vendor_crud_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create vendor
        res = await ac.post("/api/vendors", json={
            "event_id": "00000000-0000-0000-0000-000000000001",
            "name": "Artisan Floral Atelier",
            "category": "Decor",
            "quote_amount": 180000.0,
            "status": "contacted"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        vendor_id = data["vendor"]["id"]

        # Update vendor status
        patch_res = await ac.patch(f"/api/vendors/{vendor_id}", json={
            "status": "quoted"
        })
        assert patch_res.status_code == 200
        patch_data = patch_res.json()
        assert patch_data["success"] is True

@pytest.mark.asyncio
async def test_guest_crud_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create guest
        res = await ac.post("/api/guests", json={
            "event_id": "00000000-0000-0000-0000-000000000001",
            "name": "Sameer Verma",
            "party_size": 2,
            "relation": "College Friends",
            "dietary": "Vegetarian",
            "rsvp": "attending"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        guest_id = data["guest"]["id"]

        # Update guest RSVP
        patch_res = await ac.patch(f"/api/guests/{guest_id}", json={
            "rsvp": "declined"
        })
        assert patch_res.status_code == 200
        patch_data = patch_res.json()
        assert patch_data["success"] is True
