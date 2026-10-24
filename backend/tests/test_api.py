import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database import init_db
from backend.seed import seed_data

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()
    await seed_data()

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["demo_mode"] is True

@pytest.mark.asyncio
async def test_plan_task_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/tasks/plan", json={
            "prompt": "Open the inventory portal, pull Q3 sales by region and post the table to #ops-reports.",
            "portal_url": "http://localhost:8080"
        })
        assert res.status_code == 200
        data = res.json()
        assert "goal" in data
        assert "schema_definition" in data
        assert "Q3" in data["goal"] or "sales" in data["goal"].lower()

@pytest.mark.asyncio
async def test_feed_latest_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/feeds/task-q3-sales/latest")
        assert res.status_code == 200
        data = res.json()
        assert "meta" in data
        assert "data" in data
        assert data["data"]["total_revenue"] == 404950.0

@pytest.mark.asyncio
async def test_dashboard_stats():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/dashboard/stats")
        assert res.status_code == 200
        data = res.json()
        assert "success_rate_percent" in data
        assert "total_hours_saved" in data
        assert data["dollar_savings_usd"] > 0
