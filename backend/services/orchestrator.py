import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, AsyncGenerator

from sqlalchemy import select, update
from backend.database import AsyncSessionLocal
from backend.models.models import Task, Run, RunStep, FeedCache, Approval
from backend.services.browser_agent import BrowserAgentService
from backend.services.safety_engine import SafetyEngineService
from backend.services.delivery_service import DestinationDeliveryService
from backend.services.audit_service import AuditService
from backend.adapters.llm_planner import get_llm_planner

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
            id=f"step-{uuid.uuid4().hex[:8]}",
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
        Executes complete end-to-end task pipeline through the coordinated microservices state machine:
        QUEUED -> PLANNING -> NAVIGATING -> EXTRACTING -> VALIDATING -> CONFIDENCE_GATE -> (APPROVAL_REQUIRED) -> DELIVERING -> SUCCEEDED
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

            await AuditService.log_event(
                service_name="orchestrator",
                action="run.started",
                resource_type="run",
                resource_id=run_id,
                details={"task_id": task.id, "task_name": task.name}
            )

            # PHASE 1: PLANNING
            await cls.record_step(session, run_id, "planning", "in_progress", "Synthesizing execution plan and validating schema...")
            planner = get_llm_planner()
            plan_result = await planner.plan_task(task.prompt, task.portal_url)
            goal = plan_result.get("goal", task.goal)
            schema = plan_result.get("schema_definition", task.schema_definition)
            is_write = plan_result.get("is_write_action", task.is_write_action)

            await cls.record_step(session, run_id, "planning", "completed", "Goal and JSON schema synthesized successfully.", {"goal": goal})

            # PHASE 2: BROWSER AGENT EXECUTION
            run.status = "navigating"
            await session.commit()

            extracted_payload = None
            replay_url = None

            try:
                async for event in BrowserAgentService.stream_browser_progress(task.portal_url, goal, run_id):
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
                await cls.record_step(session, run_id, "browser_agent", "failed", f"Browser automation error: {str(e)}")
                await session.commit()
                await AuditService.log_event("orchestrator", "run.failed", "run", run_id, details={"error": str(e)})
                return

            if not extracted_payload:
                res_auto = await BrowserAgentService.execute_browser_workflow(task.portal_url, goal, run_id)
                if res_auto.get("status") == "BLOCKED":
                    run.status = "blocked"
                    run.error_message = res_auto.get("error")
                    await cls.record_step(session, run_id, "security_gate", "failed", res_auto.get("error", "Blocked by security policy"))
                    await session.commit()
                    return

                extracted_payload = res_auto.get("extracted_data")
                replay_url = res_auto.get("replay_url", replay_url)
                run.replay_url = replay_url

            run.extracted_data = extracted_payload
            run.status = "validating"
            await session.commit()

            # PHASE 3: RELIABILITY & SAFETY ENGINE VALIDATION
            await cls.record_step(session, run_id, "validating", "in_progress", "Executing Pydantic schema validation, null checks, and drift detection...")

            # Get historical baseline
            stmt_feed = select(FeedCache).where(FeedCache.task_id == task.id)
            res_feed = await session.execute(stmt_feed)
            feed_obj = res_feed.scalar_one_or_none()
            baseline = feed_obj.data if feed_obj else None

            val_report = SafetyEngineService.validate_dataset(extracted_payload, schema, baseline)
            run.validation_report = val_report
            run.validated_data = extracted_payload if val_report.get("valid") else None

            # Self-healing attempt if validation failed
            if not val_report.get("valid"):
                await cls.record_step(
                    session, run_id, "self_heal", "in_progress",
                    f"Validation failed (score: {val_report.get('score')}). Analyzing error trace for bounded recovery..."
                )
                from backend.services.validator import DataValidatorService
                from pydantic import BaseModel
                class ReportShim:
                    errors = val_report.get("errors", [])
                heal_prompt = DataValidatorService.generate_self_heal_prompt(ReportShim(), goal)
                retry_res = await BrowserAgentService.execute_browser_workflow(task.portal_url, heal_prompt, run_id)
                extracted_payload = retry_res.get("extracted_data", extracted_payload)
                val_report = SafetyEngineService.validate_dataset(extracted_payload, schema, baseline)
                run.validation_report = val_report
                run.extracted_data = extracted_payload

                if val_report.get("valid"):
                    run.validated_data = extracted_payload
                    await cls.record_step(session, run_id, "self_heal", "completed", "Self-healing retry succeeded! Invariants satisfied.")
                else:
                    await cls.record_step(session, run_id, "self_heal", "failed", f"Self-heal was unable to reconcile schema: {val_report.get('errors')}")

            if not val_report.get("valid"):
                run.status = "needs_review"
                await cls.record_step(session, run_id, "validating", "failed", f"Validation flagged errors (score {val_report.get('score')}): {val_report.get('errors')}")
                await session.commit()
                return

            await cls.record_step(
                session, run_id, "validating", "completed",
                f"Validation passed (Trust score: {val_report.get('score')}%). {len(val_report.get('anomalies', []))} anomalies flagged.",
                {"checks": val_report.get("checks"), "anomalies": val_report.get("anomalies")}
            )

            # PHASE 4: CONFIDENCE GATE EVALUATION
            conf_gate = await SafetyEngineService.evaluate_confidence_gate(run_id, val_report)
            await cls.record_step(
                session, run_id, "confidence_gate",
                "completed" if conf_gate["decision"] == "PASS" else "in_progress",
                f"Confidence Score: {conf_gate['confidence_score']}% -> Decision: {conf_gate['decision']}. {conf_gate['explanation']}"
            )

            if conf_gate["decision"] == "REJECT":
                run.status = "blocked"
                run.error_message = f"Confidence gate rejection: {conf_gate['explanation']}"
                await session.commit()
                return

            # PHASE 5: WRITE ACTION & APPROVAL GATE CHECK
            if is_write or conf_gate["decision"] == "REVIEW_REQUIRED":
                run.status = "needs_approval"
                approval = Approval(
                    id=f"appr-{uuid.uuid4().hex[:8]}",
                    run_id=run.id,
                    action_type="WRITE_MUTATION_GATE" if is_write else "CONFIDENCE_GATE_REVIEW",
                    current_payload={"status": "READ_ONLY_PORTAL", "records": 5},
                    proposed_payload=extracted_payload or {},
                    status="pending"
                )
                session.add(approval)
                await cls.record_step(
                    session, run_id, "approval_gate", "in_progress",
                    f"Staged in Approvals Queue for human sign-off ({approval.action_type})."
                )
                await session.commit()
                return

            # PHASE 6: DESTINATION DELIVERY
            run.status = "delivering"
            await session.commit()
            await cls.record_step(session, run_id, "delivering", "in_progress", "Dispatching validated payload to configured destinations...")

            dest_types = task.destination_types or ["slack", "feed"]
            dest_cfg = task.destination_config or {}
            receipts = []

            for d_type in dest_types:
                res_deliv = await DestinationDeliveryService.deliver_payload(
                    run_id=run.id,
                    task_id=task.id,
                    destination_type=d_type,
                    destination_config=dest_cfg,
                    validated_data=extracted_payload,
                    idempotency_key=f"{run.idempotency_key}-{d_type}",
                    replay_url=replay_url
                )
                receipts.append(res_deliv)

            # PHASE 7: UPDATE FEED CACHE
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

            await AuditService.log_event(
                service_name="orchestrator",
                action="run.succeeded",
                resource_type="run",
                resource_id=run_id,
                details={"destinations": [r["destination_type"] for r in receipts]}
            )

            # Final success event broadcast
            await broadcast_run_event(run_id, {
                "type": "run_completed",
                "run_id": run_id,
                "status": "succeeded",
                "replay_url": replay_url,
                "data": extracted_payload
            })

    @staticmethod
    async def cancel_run(run_id: str, reason: str = "Operator requested cancellation") -> Dict[str, Any]:
        """
        Gracefully cancels an active run and records the cancellation in the audit trail.
        """
        async with AsyncSessionLocal() as session:
            stmt = select(Run).where(Run.id == run_id)
            res = await session.execute(stmt)
            run = res.scalar_one_or_none()
            if not run:
                raise ValueError(f"Run {run_id} not found")

            if run.status in ["succeeded", "failed", "cancelled"]:
                return {"run_id": run.id, "status": run.status, "message": "Run already completed"}

            run.status = "cancelled"
            run.completed_at = datetime.now(timezone.utc)
            run.error_message = reason

            await OrchestrationEngine.record_step(
                session, run_id, "cancellation", "completed", f"Run cancelled by operator. Reason: {reason}"
            )
            await session.commit()

            await AuditService.log_event(
                service_name="orchestrator",
                action="run.cancelled",
                resource_type="run",
                resource_id=run_id,
                details={"reason": reason}
            )

            await broadcast_run_event(run_id, {
                "type": "run_completed",
                "run_id": run_id,
                "status": "cancelled",
                "reason": reason
            })

            return {"run_id": run_id, "status": "cancelled", "reason": reason}

async def run_pipeline(task_id: str) -> Optional[str]:
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
