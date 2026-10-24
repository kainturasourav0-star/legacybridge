import json
import logging
import re
from typing import Dict, Any, Optional
import httpx
from backend.config import settings

logger = logging.getLogger("legacybridge.llm_planner")

class LLMPlannerInterface:
    async def plan_task(self, prompt: str, portal_url: str) -> Dict[str, Any]:
        raise NotImplementedError

    def sanitize_untrusted_content(self, raw_text: str) -> str:
        """Prompt-injection guard: Strip imperative instructions injected inside scraped DOM text."""
        raise NotImplementedError


class DeterministicDemoPlanner(LLMPlannerInterface):
    """
    Deterministic Planner with built-in templates and heuristic parsing.
    Guarantees instant, zero-latency schema generation during hackathon presentations or network isolation.
    """
    def sanitize_untrusted_content(self, raw_text: str) -> str:
        if not raw_text:
            return ""
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
            "estimated_manual_minutes": 120.0 if not is_write else 45.0,
            "ai_providers": {
                "strategy": "deterministic_heuristic_engine",
                "schema": "schema_invariant_compiler"
            }
        }


class NvidiaNimPlanner:
    """
    NVIDIA AI Foundation / NIM Client.
    Specializes in enterprise workflow reasoning, multi-step navigation planning,
    and semantic legacy ERP decomposition using NVIDIA high-throughput models.
    """
    def __init__(self, api_key: str, model_name: str, base_url: str):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = base_url.rstrip("/")

    async def generate_workflow_strategy(self, prompt: str, portal_url: str) -> Optional[Dict[str, Any]]:
        if not self.api_key or self.api_key.startswith("nvapi-placeholder"):
            return None

        endpoint = f"{self.base_url}/chat/completions"
        system_instruction = (
            "You are NVIDIA Enterprise Automation Agent Planner for LegacyBridge.\n"
            "Analyze the legacy ERP modernization prompt and URL.\n"
            "Synthesize:\n"
            "1. 'goal': Detailed step-by-step navigation instructions for TinyFish browser agent.\n"
            "2. 'is_write_action': Boolean, true if writing/updating database or portal state.\n"
            "3. 'risk_rationale': Brief explanation of operational risk.\n"
            "Output valid JSON only with keys: goal, is_write_action, risk_rationale."
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    endpoint,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": f"Task: {prompt}\nTarget URL: {portal_url}"}
                        ],
                        "temperature": 0.1,
                        "max_tokens": 600
                    }
                )
                if res.status_code == 200:
                    raw_text = res.json()["choices"][0]["message"]["content"]
                    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
        except Exception as e:
            logger.warning(f"NVIDIA NIM planner call encountered error: {e}. Falling back gracefully.")
        return None


class OpenAIPlanner:
    """
    OpenAI Client.
    Specializes in strict JSON schema compilation, Pydantic invariants, and fast self-healing prompts.
    """
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name

    async def generate_schema_and_plan(self, prompt: str, portal_url: str) -> Optional[Dict[str, Any]]:
        if not self.api_key or self.api_key.startswith("sk-placeholder"):
            return None

        try:
            system_prompt = (
                "You are an expert Autonomous Web Agent Schema Architect for LegacyBridge.\n"
                "Given a user's natural language request and a legacy portal URL, generate:\n"
                "1. 'goal': Precise navigation instructions for a browser agent (TinyFish).\n"
                "2. 'schema_definition': Rigorous JSON Schema specification for validating extracted data.\n"
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
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json=payload
                )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            logger.warning(f"OpenAI planner call encountered error: {e}. Falling back gracefully.")
        return None


class DualAIWorkflowOrchestrator(LLMPlannerInterface):
    """
    Dual-Model AI Orchestrator:
    Combines NVIDIA NIM (NVIDIA API) and OpenAI API into a synchronized workflow management pipeline:
    - NVIDIA NIM: Synthesizes high-level enterprise navigation strategy, multi-frame traversal, and risk classification.
    - OpenAI: Synthesizes strict JSON Schema invariants, type constraints, and self-healing repair rules.
    - High-Availability Consensus: If either provider experiences rate-limiting, the other seamlessly assumes leadership.
    """
    def __init__(self):
        self.fallback = DeterministicDemoPlanner()
        self.nvidia = NvidiaNimPlanner(
            api_key=settings.NVIDIA_API_KEY,
            model_name=settings.NVIDIA_MODEL,
            base_url=settings.NVIDIA_BASE_URL
        )
        self.openai = OpenAIPlanner(
            api_key=settings.OPENAI_API_KEY,
            model_name=settings.LLM_MODEL
        )

    def sanitize_untrusted_content(self, raw_text: str) -> str:
        return self.fallback.sanitize_untrusted_content(raw_text)

    async def plan_task(self, prompt: str, portal_url: str) -> Dict[str, Any]:
        if settings.DEMO_MODE:
            return await self.fallback.plan_task(prompt, portal_url)

        # 1. Step 1: Query NVIDIA NIM for deep enterprise navigation strategy & risk
        nvidia_plan = None
        if settings.NVIDIA_API_KEY:
            nvidia_plan = await self.nvidia.generate_workflow_strategy(prompt, portal_url)

        # 2. Step 2: Query OpenAI for strict schema invariants
        openai_plan = None
        if settings.OPENAI_API_KEY:
            openai_plan = await self.openai.generate_schema_and_plan(prompt, portal_url)

        # 3. Collaborative Synthesis
        if nvidia_plan and openai_plan:
            logger.info("Dual-Model Collaboration: Synthesized plan via NVIDIA NIM (Strategy) + OpenAI (Schema).")
            return {
                "goal": nvidia_plan.get("goal") or openai_plan.get("goal"),
                "schema_definition": openai_plan.get("schema_definition"),
                "is_write_action": nvidia_plan.get("is_write_action", openai_plan.get("is_write_action", False)),
                "estimated_manual_minutes": openai_plan.get("estimated_manual_minutes", 120.0),
                "ai_providers": {
                    "strategy_engine": f"nvidia-nim ({settings.NVIDIA_MODEL})",
                    "schema_engine": f"openai ({settings.LLM_MODEL})",
                    "orchestration_mode": "dual_model_collaborative"
                }
            }
        elif nvidia_plan:
            # NVIDIA active, compile fallback schema
            demo_base = await self.fallback.plan_task(prompt, portal_url)
            return {
                "goal": nvidia_plan.get("goal", demo_base["goal"]),
                "schema_definition": demo_base["schema_definition"],
                "is_write_action": nvidia_plan.get("is_write_action", demo_base["is_write_action"]),
                "estimated_manual_minutes": demo_base.get("estimated_manual_minutes", 120.0),
                "ai_providers": {
                    "strategy_engine": f"nvidia-nim ({settings.NVIDIA_MODEL})",
                    "schema_engine": "schema_invariant_compiler",
                    "orchestration_mode": "nvidia_nim_primary"
                }
            }
        elif openai_plan:
            return {
                **openai_plan,
                "ai_providers": {
                    "strategy_engine": f"openai ({settings.LLM_MODEL})",
                    "schema_engine": f"openai ({settings.LLM_MODEL})",
                    "orchestration_mode": "openai_primary"
                }
            }

        # Zero-latency fallback
        return await self.fallback.plan_task(prompt, portal_url)


def get_llm_planner() -> LLMPlannerInterface:
    if settings.DEMO_MODE:
        return DeterministicDemoPlanner()
    return DualAIWorkflowOrchestrator()
