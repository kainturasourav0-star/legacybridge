import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, AsyncGenerator

from sqlalchemy import select, update
from backend.database import AsyncSessionLocal
from backend.models.models import Task, Run, RunStep, FeedCache, Approval
from backend.adapters.tinyfish_client import get_tinyfish_client
from backend.adapters.llm_planner import get_llm_planner
from backend.services.validator import DataValidatorService
from backend.adapters.delivery_adapters import SlackDeliveryAdapter, WebhookDeliveryAdapter, SheetsDeliveryAdapter

logger = logging.getLogger("legacybridge.orchestrator")

# In-memory pub/sub queues for live SSE streams keyed by run_id
_SSE_RUN_QUEUES: Dict[str, asyncio.Queue] = {}

def get_run_queue(run_id: str) -> asyncio.Queue:
    if run_id not in _SSE_RUN_QUEUES:
        _SSE_RUN_QUEUES[run_id] = asyncio.Queue()
    return _SSE_RUN_QUEUES[run_id]

async def broadcast_run_event(run_id: str, event_data: Dict[str, Any]):
    q = get_run_queue(run_id)
    await q.put(event_data)

class OrchestrationEngine:
    @staticmethod
    async def record_step(session, run_id: str, step_name: str, status: str, message: str, details: Optional[Dict[str, Any]] = None):
        step = RunStep(
            run_id=run_id,
            step_name=step_name,
            status=status,
            message=message,
            details=details,
            timestamp=datetime.now(timezone.utc)
        )
        session.add(step)
        await session.flush()

        event = {
            "type": "step_update",
            "run_id": run_id,
            "step": step_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": step.timestamp.isoformat()
        }
        await broadcast_run_event(run_id, event)

    @classmethod
    async def execute_task_run(cls, run_id: str):
        """
        Executes complete end-to-end task pipeline through the state machine.
        queued -> planning -> signing_in -> navigating -> extracting -> validating -> (needs_approval) -> delivering -> succeeded
        """
        async with AsyncSessionLocal() as session:
            # 1. Fetch Run and Task
            stmt = select(Run).where(Run.id == run_id)
            res = await session.execute(stmt)
            run = res.scalar_one_or_none()
            if not run:
                logger.error(f"Run {run_id} not found")
                return

            stmt_task = select(Task).where(Task.id == run.task_id)
            res_task = await session.execute(stmt_task)
            task = res_task.scalar_one_or_none()
            if not task:
                logger.error(f"Task for run {run_id} not found")
                return

            run.status = "planning"
            await session.commit()

            # Record Planning Step
            await cls.record_step(session, run_id, "planning", "in_progress", "Synthesizing execution plan and validating schema...")

            planner = get_llm_planner()
            plan_result = await planner.plan_task(task.prompt, task.portal_url)
            goal = plan_result.get("goal", task.goal)
            schema = plan_result.get("schema_definition", task.schema_definition)
            is_write = plan_result.get("is_write_action", task.is_write_action)

            await cls.record_step(session, run_id, "planning", "completed", "Goal and JSON schema synthesized successfully.", {"goal": goal})

            # TinyFish Client
            tf_client = get_tinyfish_client()
            extracted_payload = None
            replay_url = None

            # Stream TinyFish steps
            try:
                async for event in tf_client.stream_automation_events(task.portal_url, goal):
                    step_name = event.get("step", "navigating")
                    msg = event.get("message", "")
                    rep = event.get("replay_url")
                    if rep:
                        replay_url = rep
                        run.replay_url = rep

                    if step_name == "done":
                        extracted_payload = event.get("extracted_data")
                    else:
                        await cls.record_step(session, run_id, step_name, "in_progress" if event.get("status") == "RUNNING" else "completed", msg)

                    await session.commit()
            except Exception as e:
                run.status = "failed"
                run.error_message = str(e)
                await cls.record_step(session, run_id, "agent_execution", "failed", f"TinyFish automation error: {str(e)}")
                await session.commit()
                return

            if not extracted_payload:
                res_auto = await tf_client.run_automation(task.portal_url, goal)
                extracted_payload = res_auto.get("extracted_data")
                replay_url = res_auto.get("replay_url", replay_url)
                run.replay_url = replay_url

            run.extracted_data = extracted_payload
            run.status = "validating"
            await session.commit()

            # 2. Validation & Quality Checks
            await cls.record_step(session, run_id, "validating", "in_progress", "Executing Pydantic schema validation, null checks, and drift detection...")

            # Get baseline from FeedCache if available
            baseline = None
            stmt_feed = select(FeedCache).where(FeedCache.task_id == task.id)
            res_feed = await session.execute(stmt_feed)
            feed_obj = res_feed.scalar_one_or_none()
            if feed_obj and feed_obj.data:
                baseline = feed_obj.data

            validation_report = DataValidatorService.validate_payload(extracted_payload, schema, baseline)
            run.validation_report = validation_report.model_dump()
            run.validated_data = extracted_payload if validation_report.valid else None

            # Self-healing attempt if validation failed
            if not validation_report.valid:
                await cls.record_step(
                    session, run_id, "self_heal", "in_progress",
                    f"Validation failed (score: {validation_report.score}). Initiating targeted self-healing retry with validator error trace..."
                )
                heal_prompt = DataValidatorService.generate_self_heal_prompt(validation_report, goal)
                retry_res = await tf_client.run_automation(task.portal_url, heal_prompt)
                extracted_payload = retry_res.get("extracted_data", extracted_payload)
                validation_report = DataValidatorService.validate_payload(extracted_payload, schema, baseline)
                run.validation_report = validation_report.model_dump()
                run.extracted_data = extracted_payload

                if validation_report.valid:
                    run.validated_data = extracted_payload
                    await cls.record_step(session, run_id, "self_heal", "completed", "Self-healing retry succeeded! Schema invariants satisfied.")
                else:
                    await cls.record_step(session, run_id, "self_heal", "failed", f"Self-heal was unable to reconcile schema: {validation_report.errors}")

            if not validation_report.valid:
                run.status = "needs_review"
                await cls.record_step(session, run_id, "validating", "failed", f"Validation flagged errors (score {validation_report.score}): {validation_report.errors}")
                await session.commit()
                return

            await cls.record_step(
                session, run_id, "validating", "completed",
                f"Validation passed (Trust score: {validation_report.score}%). {len(validation_report.anomalies)} anomalies flagged.",
                {"checks": validation_report.checks, "anomalies": validation_report.anomalies}
            )

            # 3. Check for Approval Requirement (Write Action Gate)
            if is_write:
                run.status = "needs_approval"
                approval = Approval(
                    run_id=run.id,
                    action_type="WRITE_MUTATION_GATE",
                    current_payload={"status": "READ_ONLY_PORTAL", "records": 5},
                    proposed_payload=extracted_payload or {},
                    status="pending"
                )
                session.add(approval)
                await cls.record_step(
                    session, run_id, "approval_gate", "in_progress",
                    "Write action detected! Staged in Approvals Queue for human operator sign-off."
                )
                await session.commit()
                return

            # 4. Delivery Phase
            run.status = "delivering"
            await session.commit()
            await cls.record_step(session, run_id, "delivering", "in_progress", "Dispatching validated payload to configured destinations...")

            receipts = []
            dest_types = task.destination_types or ["slack", "feed"]
            dest_cfg = task.destination_config or {}

            if "slack" in dest_types:
                ch = dest_cfg.get("slack_channel", "#ops-reports")
                slk_res = await SlackDeliveryAdapter.deliver(ch, extracted_payload, f"{run.idempotency_key}-slack", replay_url)
                receipts.append(slk_res.to_dict())

            if "sheets" in dest_types:
                sh_name = dest_cfg.get("sheet_name", "Q3_Sales_Master")
                sh_res = await SheetsDeliveryAdapter.deliver(sh_name, extracted_payload, f"{run.idempotency_key}-sheets")
                receipts.append(sh_res.to_dict())

            if "webhook" in dest_types:
                wh_url = dest_cfg.get("webhook_url", settings.DEFAULT_WEBHOOK_URL)
                wh_res = await WebhookDeliveryAdapter.deliver(wh_url, extracted_payload, f"{run.idempotency_key}-webhook")
                receipts.append(wh_res.to_dict())

            # 5. Update Feed Cache for GET /api/v1/feeds/{task_id}/latest
            if feed_obj:
                feed_obj.latest_run_id = run.id
                feed_obj.data = extracted_payload
                feed_obj.item_count = len(extracted_payload.get("items", [])) if isinstance(extracted_payload, dict) else 1
                feed_obj.last_updated = datetime.now(timezone.utc)
            else:
                new_feed = FeedCache(
                    task_id=task.id,
                    latest_run_id=run.id,
                    data=extracted_payload,
                    item_count=len(extracted_payload.get("items", [])) if isinstance(extracted_payload, dict) else 1,
                    last_updated=datetime.now(timezone.utc)
                )
                session.add(new_feed)

            run.status = "succeeded"
            run.completed_at = datetime.now(timezone.utc)
            await cls.record_step(
                session, run_id, "delivering", "completed",
                f"Delivered to {len(receipts)} destinations. Feed endpoint updated.",
                {"receipts": receipts}
            )
            await session.commit()

            # Final success event
            await broadcast_run_event(run_id, {
                "type": "run_completed",
                "run_id": run_id,
                "status": "succeeded",
                "replay_url": replay_url,
                "data": extracted_payload
            })

async def run_pipeline(task_id: str) -> Optional[str]:
    """
    Creates a new Run for the given task_id and executes it through OrchestrationEngine.
    Used by APScheduler and background Celery worker processors.
    """
    async with AsyncSessionLocal() as session:
        stmt = select(Task).where(Task.id == task_id)
        res = await session.execute(stmt)
        task = res.scalar_one_or_none()
        if not task:
            logger.error(f"Cannot run pipeline: task {task_id} not found")
            return None

        run_id = f"run-cron-{uuid.uuid4().hex[:8]}"
        run = Run(
            id=run_id,
            task_id=task.id,
            status="queued",
            trigger_type="schedule",
            idempotency_key=f"idem-{run_id}",
            time_saved_minutes=120.0 if not task.is_write_action else 45.0,
            started_at=datetime.now(timezone.utc)
        )
        session.add(run)
        await session.commit()

    await OrchestrationEngine.execute_task_run(run_id)
    return run_id

