import asyncio
import json
import os
import uuid
from typing import AsyncGenerator, Dict, Any, Optional
import httpx
from backend.config import settings

class TinyFishClientInterface:
    async def run_automation(self, url: str, goal: str, credentials: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Synchronously execute automation task."""
        raise NotImplementedError

    async def stream_automation_events(self, url: str, goal: str, credentials: Optional[Dict[str, str]] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream SSE automation progress events."""
        raise NotImplementedError

    async def run_batch(self, tasks: list) -> Dict[str, Any]:
        """Execute batch automation across multiple portals."""
        raise NotImplementedError

    async def get_run_status(self, run_id: str) -> Dict[str, Any]:
        """Query TinyFish run status by ID."""
        raise NotImplementedError


class TinyFishDemoClient(TinyFishClientInterface):
    """
    Deterministic Mock Client for Hackathon Live Demo.
    Provides realistic SSE timing, zero network failure risk, and loads record & replay fixtures.
    """
    def __init__(self):
        fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "sample_run_replay.json")
        if os.path.exists(fixture_path):
            with open(fixture_path, "r", encoding="utf-8") as f:
                self.fixture = json.load(f)
        else:
            self.fixture = {}

    async def stream_automation_events(self, url: str, goal: str, credentials: Optional[Dict[str, str]] = None) -> AsyncGenerator[Dict[str, Any], None]:
        run_id = f"tf-run-demo-{uuid.uuid4().hex[:8]}"
        replay_url = "https://agent.tinyfish.ai/replays/rf-demo-q3-acme-78192a"

        steps = [
            ("signing_in", "Navigating to legacy portal and injecting Vault credentials into workstation logon...", 1.2),
            ("signing_in", "SSO workstation logon accepted. Handshaking 128-bit RC4 session...", 1.0),
            ("navigating", "Expanding Explorer frame: Reports & Audits -> Q3 Regional Sales Ledger...", 1.4),
            ("navigating", "Frame loaded. Detected table with pagination. Notice: CSV direct export disabled.", 1.2),
            ("extracting", "Scraping Page 1 records: North America, Europe West, Asia Pacific...", 1.5),
            ("navigating", "Semantic vision located Next Page action. Navigating to Page 2...", 1.2),
            ("extracting", "Scraping Page 2 records: Latin America, Middle East. Aggregating dataset...", 1.2),
            ("completed", "Extracted 5 tabular records. Gross Revenue: $404,950.00. Dispatching to validation pipeline.", 0.8)
        ]

        for step_name, msg, delay in steps:
            await asyncio.sleep(delay)
            yield {
                "run_id": run_id,
                "step": step_name,
                "message": msg,
                "replay_url": replay_url,
                "status": "RUNNING" if step_name != "completed" else "COMPLETED"
            }

        yield {
            "run_id": run_id,
            "step": "done",
            "message": "Automation finished successfully",
            "replay_url": replay_url,
            "extracted_data": self.fixture.get("extracted_data"),
            "status": "COMPLETED"
        }

    async def run_automation(self, url: str, goal: str, credentials: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        await asyncio.sleep(1.5)
        return {
            "run_id": f"tf-run-demo-{uuid.uuid4().hex[:8]}",
            "status": "COMPLETED",
            "goal": goal,
            "replay_url": "https://agent.tinyfish.ai/replays/rf-demo-q3-acme-78192a",
            "extracted_data": self.fixture.get("extracted_data", {})
        }

    async def run_batch(self, tasks: list) -> Dict[str, Any]:
        await asyncio.sleep(1.0)
        return {
            "batch_id": f"batch-{uuid.uuid4().hex[:8]}",
            "total_tasks": len(tasks),
            "status": "COMPLETED",
            "results": [
                {"task_index": i, "status": "COMPLETED", "data": self.fixture.get("extracted_data")}
                for i in range(len(tasks))
            ]
        }

    async def get_run_status(self, run_id: str) -> Dict[str, Any]:
        return {
            "run_id": run_id,
            "status": "COMPLETED",
            "replay_url": "https://agent.tinyfish.ai/replays/rf-demo-q3-acme-78192a"
        }


class TinyFishRealClient(TinyFishClientInterface):
    """
    Real TinyFish Web Agent Client conforming to docs.tinyfish.ai specifications:
    - Base URL: https://agent.tinyfish.ai
    - Auth: Header `X-API-Key: <TINYFISH_API_KEY>`
    - Endpoints:
        POST /v1/automation/run (sync)
        POST /v1/automation/run-sse (SSE stream)
        POST /v1/automation/run-async (async)
        GET /v1/runs/{id}
    """
    def __init__(self, api_key: str, base_url: str = "https://agent.tinyfish.ai"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }

    async def run_automation(self, url: str, goal: str, credentials: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/v1/automation/run"
        payload = {
            "url": url,
            "goal": goal
        }
        if credentials:
            payload["auth"] = credentials

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(endpoint, headers=self.headers, json=payload)
            resp.raise_for_status()
            return resp.json()

    async def stream_automation_events(self, url: str, goal: str, credentials: Optional[Dict[str, str]] = None) -> AsyncGenerator[Dict[str, Any], None]:
        endpoint = f"{self.base_url}/v1/automation/run-sse"
        payload = {
            "url": url,
            "goal": goal
        }
        if credentials:
            payload["auth"] = credentials

        async with httpx.AsyncClient(timeout=180.0) as client:
            async with client.stream("POST", endpoint, headers=self.headers, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str:
                            try:
                                yield json.loads(data_str)
                            except json.JSONDecodeError:
                                yield {"raw_event": data_str}

    async def run_batch(self, tasks: list) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/v1/automation/batch"
        payload = {"tasks": tasks}
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(endpoint, headers=self.headers, json=payload)
            resp.raise_for_status()
            return resp.json()

    async def get_run_status(self, run_id: str) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/v1/runs/{run_id}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(endpoint, headers=self.headers)
            resp.raise_for_status()
            return resp.json()


def get_tinyfish_client() -> TinyFishClientInterface:
    if settings.DEMO_MODE:
        return TinyFishDemoClient()
    return TinyFishRealClient(api_key=settings.TINYFISH_API_KEY, base_url=settings.TINYFISH_BASE_URL)
