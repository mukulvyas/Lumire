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
        assert len(data["questions"]) >= 2
