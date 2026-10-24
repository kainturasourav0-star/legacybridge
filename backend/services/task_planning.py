import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select, desc
from backend.database import AsyncSessionLocal
from backend.models.models import Task, TaskVersion
from backend.adapters.llm_planner import get_llm_planner
from backend.services.identity_vault import IdentityVaultService

logger = logging.getLogger("legacybridge.task_planning")

class TaskPlanningService:
    @staticmethod
    async def plan_from_natural_language(prompt: str, portal_url: str = "http://localhost:8080") -> Dict[str, Any]:
        """
        Synthesizes structured, editable workflow plan from natural language prompt.
        Validates target URL against authorized domain allowlist.
        """
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty")

        # Security check: authorized domain
        is_auth = await IdentityVaultService.is_domain_authorized(portal_url)
        if not is_auth:
            raise PermissionError(f"Target portal URL '{portal_url}' is not on the authorized domain allowlist.")

        planner = get_llm_planner()
        raw_plan = await planner.plan_task(prompt, portal_url)

        # Enforce risk classification & approval requirements
        is_write = raw_plan.get("is_write_action", False)
        risk_level = "HIGH" if is_write else "LOW"

        # Formal structured plan
        plan = {
            "plan_id": f"plan-{uuid.uuid4().hex[:8]}",
            "prompt": prompt,
            "goal": raw_plan.get("goal", f"Extract structured data from {portal_url} according to '{prompt}'"),
            "portal_url": portal_url,
            "schema_definition": raw_plan.get("schema_definition", {
                "type": "object",
                "required": ["items"],
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["region", "revenue"],
                            "properties": {
                                "region": {"type": "string"},
                                "revenue": {"type": "number"}
                            }
                        }
                    }
                }
            }),
            "navigation_requirements": [
                "Navigate to target URL and inject workstation session",
                "Traverse Explorer frame and open target report ledger",
                "Paginate across data tables and extract tabular records"
            ],
            "validation_assertions": [
                "Required schema fields present",
                "Non-zero row count",
                "Null value ratio < 5%",
                "Revenue shift <= 30% against historical baseline"
            ],
            "destination_types": ["slack", "feed"],
            "destination_config": {"slack_channel": "#ops-reports"},
            "is_write_action": is_write,
            "risk_level": risk_level,
            "requires_approval": is_write,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        return plan

    @staticmethod
    async def create_task(
        name: str,
        prompt: str,
        goal: str,
        schema_definition: Dict[str, Any],
        portal_url: str = "http://localhost:8080",
        credential_id: Optional[str] = None,
        destination_types: Optional[List[str]] = None,
        destination_config: Optional[Dict[str, Any]] = None,
        schedule_cron: Optional[str] = None,
        schedule_human: Optional[str] = None,
        is_write_action: bool = False
    ) -> Dict[str, Any]:
        """
        Creates a new reusable workflow task with an initial version record (Version 1).
        """
        is_auth = await IdentityVaultService.is_domain_authorized(portal_url)
        if not is_auth:
            raise PermissionError(f"Cannot save task: Portal URL '{portal_url}' is not on authorized domain allowlist.")

        async with AsyncSessionLocal() as session:
            task_id = f"task-{uuid.uuid4().hex[:8]}"
            task = Task(
                id=task_id,
                name=name,
                prompt=prompt,
                goal=goal,
                schema_definition=schema_definition,
                portal_url=portal_url,
                credential_id=credential_id,
                destination_types=destination_types or ["slack", "feed"],
                destination_config=destination_config or {},
                schedule_cron=schedule_cron,
                schedule_human=schedule_human,
                is_write_action=is_write_action,
                risk_level="HIGH" if is_write_action else "LOW",
                requires_approval=is_write_action,
                created_at=datetime.now(timezone.utc)
            )
            session.add(task)

            # Record Version 1
            v1 = TaskVersion(
                id=f"ver-{uuid.uuid4().hex[:8]}",
                task_id=task_id,
                version_number=1,
                prompt=prompt,
                goal=goal,
                schema_definition=schema_definition,
                change_summary="Initial task version created",
                created_at=datetime.now(timezone.utc)
            )
            session.add(v1)

            await session.commit()
            return {
                "id": task.id,
                "name": task.name,
                "goal": task.goal,
                "portal_url": task.portal_url,
                "version": 1,
                "is_write_action": task.is_write_action,
                "risk_level": task.risk_level
            }

    @staticmethod
    async def duplicate_task(task_id: str) -> Dict[str, Any]:
        async with AsyncSessionLocal() as session:
            stmt = select(Task).where(Task.id == task_id)
            res = await session.execute(stmt)
            task = res.scalar_one_or_none()
            if not task:
                raise ValueError("Task not found")

            dup_id = f"task-{uuid.uuid4().hex[:8]}"
            dup = Task(
                id=dup_id,
                name=f"{task.name} (Copy)",
                prompt=task.prompt,
                goal=task.goal,
                schema_definition=task.schema_definition,
                portal_url=task.portal_url,
                credential_id=task.credential_id,
                destination_types=task.destination_types,
                destination_config=task.destination_config,
                schedule_cron=task.schedule_cron,
                schedule_human=task.schedule_human,
                is_write_action=task.is_write_action,
                risk_level=task.risk_level,
                requires_approval=task.requires_approval,
                created_at=datetime.now(timezone.utc)
            )
            session.add(dup)
            await session.commit()
            return {"id": dup.id, "name": dup.name, "duplicated_from": task_id}

    @staticmethod
    async def archive_task(task_id: str) -> bool:
        async with AsyncSessionLocal() as session:
            stmt = select(Task).where(Task.id == task_id)
            res = await session.execute(stmt)
            task = res.scalar_one_or_none()
            if not task:
                return False
            task.is_archived = True
            await session.commit()
            return True
