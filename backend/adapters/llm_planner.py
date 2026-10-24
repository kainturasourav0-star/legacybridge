import json
import re
from typing import Dict, Any, Tuple
from backend.config import settings

class LLMPlannerInterface:
    async def plan_task(self, prompt: str, portal_url: str) -> Dict[str, Any]:
        raise NotImplementedError

    def sanitize_untrusted_content(self, raw_text: str) -> str:
        """Prompt-injection guard: Strip imperative instructions injected inside scraped DOM text."""
        raise NotImplementedError


class DeterministicDemoPlanner(LLMPlannerInterface):
    """
    Deterministic Planner with built-in templates and heuristic parsing.
    Guarantees instant, zero-latency schema generation during hackathon presentations.
    """
    def sanitize_untrusted_content(self, raw_text: str) -> str:
        if not raw_text:
            return ""
        # Strip common prompt injection patterns e.g. "Ignore previous instructions", "SYSTEM:", "ASSISTANT:"
        patterns = [
            r"ignore\s+(all\s+)?previous\s+instructions",
            r"system:\s*",
            r"admin\s+override\s*:\s*",
            r"disregard\s+the\s+above"
        ]
        sanitized = raw_text
        for p in patterns:
            sanitized = re.sub(p, "[REDACTED_POTENTIAL_INJECTION]", sanitized, flags=re.IGNORECASE)
        return sanitized

    async def plan_task(self, prompt: str, portal_url: str) -> Dict[str, Any]:
        p_lower = prompt.lower()
        is_write = any(w in p_lower for w in ["update", "modify", "change", "bump", "delete", "post write", "reorder"])

        if "sales" in p_lower or "q3" in p_lower or "revenue" in p_lower or "inventory" in p_lower:
            goal = (
                f"Navigate to {portal_url}. Authenticate using workstation credentials from Vault. "
                "Traverse the Explorer menu: Reports & Audits -> Q3 Regional Sales Ledger. "
                "Paginate through all table pages and extract region, SKU, product name, units sold, unit price, and gross revenue. "
                "Aggregate total revenue and verify table totals."
            )
            schema = {
                "type": "object",
                "properties": {
                    "report_title": {"type": "string"},
                    "period": {"type": "string"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["region", "sku", "units_sold", "revenue"],
                            "properties": {
                                "region": {"type": "string"},
                                "sku": {"type": "string"},
                                "product_name": {"type": "string"},
                                "units_sold": {"type": "integer", "minimum": 0},
                                "unit_price": {"type": "number", "minimum": 0},
                                "revenue": {"type": "number", "minimum": 0}
                            }
                        }
                    },
                    "total_revenue": {"type": "number"}
                },
                "required": ["report_title", "items", "total_revenue"]
            }
        elif is_write:
            goal = (
                f"Navigate to {portal_url}. Authenticate using workstation credentials from Vault. "
                f"Execute parameterized write modification: '{prompt}'. "
                "Capture pre-mutation snapshot and stage changes for human approval gate."
            )
            schema = {
                "type": "object",
                "properties": {
                    "action": {"type": "string"},
                    "target_sku": {"type": "string"},
                    "previous_value": {"type": "number"},
                    "proposed_value": {"type": "number"},
                    "requires_approval": {"type": "boolean"}
                },
                "required": ["action", "target_sku", "proposed_value"]
            }
        else:
            goal = f"Navigate to {portal_url}. Sign in with Vault credentials and extract requested information according to prompt: '{prompt}'."
            schema = {
                "type": "object",
                "properties": {
                    "extracted_items": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "string"}
                },
                "required": ["extracted_items"]
            }

        return {
            "goal": goal,
            "schema_definition": schema,
            "is_write_action": is_write,
            "estimated_manual_minutes": 120.0 if not is_write else 45.0
        }


class LangChainOpenAIPlanner(LLMPlannerInterface):
    """
    Live LLM Planner using OpenAI / LangChain.
    Falls back gracefully to DeterministicDemoPlanner if keys are missing or offline.
    """
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = DeterministicDemoPlanner()

    def sanitize_untrusted_content(self, raw_text: str) -> str:
        return self.fallback.sanitize_untrusted_content(raw_text)

    async def plan_task(self, prompt: str, portal_url: str) -> Dict[str, Any]:
        if not self.api_key or self.api_key.startswith("sk-placeholder") or settings.DEMO_MODE:
            return await self.fallback.plan_task(prompt, portal_url)

        try:
            import httpx
            system_prompt = (
                "You are an expert Autonomous Web Agent Planner for LegacyBridge.\n"
                "Given a user's natural language request and a legacy portal URL, generate:\n"
                "1. 'goal': Precise navigation instructions for a browser agent (TinyFish).\n"
                "2. 'schema_definition': JSON Schema specification for validating extracted data.\n"
                "3. 'is_write_action': Boolean, true if task performs mutations or edits.\n"
                "4. 'estimated_manual_minutes': Realistic manual human time in minutes.\n"
                "Return ONLY a valid JSON object matching these keys."
            )
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Task: {prompt}\nPortal: {portal_url}"}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json=payload
                )
                res.raise_for_status()
                content = res.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception:
            return await self.fallback.plan_task(prompt, portal_url)


def get_llm_planner() -> LLMPlannerInterface:
    if settings.DEMO_MODE or not settings.OPENAI_API_KEY:
        return DeterministicDemoPlanner()
    return LangChainOpenAIPlanner(api_key=settings.OPENAI_API_KEY, model_name=settings.LLM_MODEL)
