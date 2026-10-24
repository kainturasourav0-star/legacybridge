import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, desc
from backend.database import AsyncSessionLocal
from backend.models.models import AuditEvent, StoredReport, Run, Task

logger = logging.getLogger("legacybridge.audit")

class AuditService:
    @staticmethod
    async def log_event(
        service_name: str,
        action: str,
        resource_type: str,
        resource_id: str,
        actor: str = "system",
        correlation_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditEvent:
        """
        Appends an immutable audit event to the audit trail.
        Never logs sensitive secrets (redacts authorization keys/tokens).
        """
        clean_details = None
        if details:
            # Redact any sensitive keys
            clean_details = {}
            for k, v in details.items():
                if any(sec in k.lower() for sec in ["secret", "password", "token", "key", "auth"]):
                    clean_details[k] = "[REDACTED_SECRET]"
                else:
                    clean_details[k] = v

        event_id = f"aud-{uuid.uuid4().hex[:8]}"
        corr_id = correlation_id or f"corr-{uuid.uuid4().hex[:8]}"

        async with AsyncSessionLocal() as session:
            event = AuditEvent(
                id=event_id,
                correlation_id=corr_id,
                actor=actor,
                service_name=service_name,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=clean_details,
                ip_address=ip_address,
                timestamp=datetime.now(timezone.utc)
            )
            session.add(event)
            await session.commit()
            logger.info(f"[AUDIT] {service_name}:{action} on {resource_type}/{resource_id} by {actor} ({corr_id})")
            return event

    @staticmethod
    async def get_audit_trail(
        resource_id: Optional[str] = None,
        service_name: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        async with AsyncSessionLocal() as session:
            stmt = select(AuditEvent).order_by(desc(AuditEvent.timestamp)).limit(limit)
            if resource_id:
                stmt = stmt.where(AuditEvent.resource_id == resource_id)
            if service_name:
                stmt = stmt.where(AuditEvent.service_name == service_name)
            res = await session.execute(stmt)
            events = res.scalars().all()
            return [
                {
                    "id": e.id,
                    "correlation_id": e.correlation_id,
                    "actor": e.actor,
                    "service_name": e.service_name,
                    "action": e.action,
                    "resource_type": e.resource_type,
                    "resource_id": e.resource_id,
                    "details": e.details,
                    "timestamp": e.timestamp.isoformat() if e.timestamp else None
                }
                for e in events
            ]

    @staticmethod
    async def generate_run_report(run_id: str, format_type: str = "json") -> Dict[str, Any]:
        """
        Generates a comprehensive execution audit report from actual persisted run results.
        Supports JSON and HTML formats.
        """
        async with AsyncSessionLocal() as session:
            stmt = select(Run).where(Run.id == run_id)
            res = await session.execute(stmt)
            run = res.scalar_one_or_none()
            if not run:
                raise ValueError(f"Run {run_id} not found")

            stmt_task = select(Task).where(Task.id == run.task_id)
            res_task = await session.execute(stmt_task)
            task = res_task.scalar_one_or_none()

            from backend.models.models import DeliveryRecord
            stmt_deliv = select(DeliveryRecord).where(DeliveryRecord.run_id == run.id)
            res_deliv = await session.execute(stmt_deliv)
            deliv_records = res_deliv.scalars().all()

            report_data = {
                "report_id": f"rep-{uuid.uuid4().hex[:8]}",
                "run_id": run.id,
                "task_id": run.task_id,
                "task_name": task.name if task else "Unknown Task",
                "status": run.status,
                "execution_summary": {
                    "started_at": run.started_at.isoformat() if run.started_at else None,
                    "completed_at": run.completed_at.isoformat() if run.completed_at else None,
                    "time_saved_minutes": run.time_saved_minutes,
                    "replay_url": run.replay_url,
                },
                "validation": run.validation_report or {},
                "extracted_sample": run.extracted_data or {},
                "delivery_summary": [
                    {
                        "type": d.destination_type,
                        "target": d.destination_target,
                        "status": d.status,
                        "receipt": d.receipt
                    }
                    for d in deliv_records
                ],
                "generated_at": datetime.now(timezone.utc).isoformat()
            }

            if format_type == "html":
                html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>LegacyBridge Run Report — {run.id}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 30px; }}
        .header {{ border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }}
        .badge {{ background: #1e293b; color: #38bdf8; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }}
        .badge.succeeded {{ background: #064e3b; color: #34d399; }}
        .card {{ background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
        th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #1e293b; }}
        th {{ background: #1e293b; color: #94a3b8; font-size: 13px; }}
        pre {{ background: #050811; padding: 12px; border-radius: 8px; overflow-x: auto; color: #a5b4fc; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>LegacyBridge Intelligence & Modernization Report</h1>
        <p>Run ID: <code>{run.id}</code> | Status: <span class="badge {run.status}">{run.status.upper()}</span></p>
    </div>
    <div class="card">
        <h3>Task Information</h3>
        <p><strong>Name:</strong> {report_data['task_name']}</p>
        <p><strong>Target Portal:</strong> {task.portal_url if task else 'N/A'}</p>
        <p><strong>Replay URL:</strong> <a href="{run.replay_url or '#'}" style="color: #60a5fa;" target="_blank">{run.replay_url or 'N/A'}</a></p>
    </div>
    <div class="card">
        <h3>Validation & Parity Score</h3>
        <pre>{json.dumps(run.validation_report or {{}}, indent=2)}</pre>
    </div>
    <div class="card">
        <h3>Extracted Data Artifact</h3>
        <pre>{json.dumps(run.extracted_data or {{}}, indent=2)}</pre>
    </div>
</body>
</html>"""
                stored = StoredReport(
                    id=report_data["report_id"],
                    title=f"Report for Run {run.id}",
                    report_type="RUN_SUMMARY",
                    run_id=run.id,
                    task_id=run.task_id,
                    format="html",
                    content=html_content,
                    evidence_links=[run.replay_url] if run.replay_url else [],
                    generated_at=datetime.now(timezone.utc)
                )
                session.add(stored)
                await session.commit()
                return {"report_id": stored.id, "format": "html", "content": html_content}

            # Default JSON
            json_str = json.dumps(report_data, indent=2)
            stored = StoredReport(
                id=report_data["report_id"],
                title=f"Report for Run {run.id}",
                report_type="RUN_SUMMARY",
                run_id=run.id,
                task_id=run.task_id,
                format="json",
                content=json_str,
                evidence_links=[run.replay_url] if run.replay_url else [],
                generated_at=datetime.now(timezone.utc)
            )
            session.add(stored)
            await session.commit()
            return report_data
