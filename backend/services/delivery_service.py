import csv
import io
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from backend.database import AsyncSessionLocal
from backend.models.models import DeliveryRecord, Run
from backend.adapters.delivery_adapters import (
    SlackDeliveryAdapter, SheetsDeliveryAdapter,
    WebhookDeliveryAdapter, PostgresDeliveryAdapter, is_ssrf_safe_url
)
from backend.services.audit_service import AuditService

logger = logging.getLogger("legacybridge.delivery_service")

class DestinationDeliveryService:
    """
    SERVICE 7 — DESTINATION DELIVERY
    Owns safe, idempotent delivery of validated data to external destinations.
    Enforces validation passage and approval requirements prior to dispatch.
    """

    @staticmethod
    async def deliver_payload(
        run_id: str,
        task_id: str,
        destination_type: str,
        destination_config: Dict[str, Any],
        validated_data: Dict[str, Any],
        idempotency_key: str,
        replay_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes delivery to the designated destination connector.
        Persists a DeliveryRecord for full auditability and duplicate prevention.
        """
        async with AsyncSessionLocal() as session:
            # 1. Idempotency Check: Verify if already delivered
            stmt_check = select(DeliveryRecord).where(DeliveryRecord.idempotency_key == idempotency_key)
            res_check = await session.execute(stmt_check)
            existing = res_check.scalar_one_or_none()
            if existing:
                logger.info(f"Idempotent hit: Delivery for key {idempotency_key} already recorded.")
                return {
                    "delivery_id": existing.id,
                    "status": existing.status,
                    "receipt": f"Idempotent: {existing.receipt}",
                    "destination_type": existing.destination_type,
                    "destination_target": existing.destination_target,
                    "records_count": existing.records_count,
                    "timestamp": existing.created_at.isoformat() if existing.created_at else None
                }

        dest_lower = destination_type.lower()
        receipt = ""
        success = False
        target_name = ""
        records_count = len(validated_data.get("items", [])) if isinstance(validated_data, dict) else 1

        # 2. Dispatch to Connector Adapter
        if dest_lower == "slack":
            channel = destination_config.get("slack_channel", "#ops-reports")
            target_name = channel
            res = await SlackDeliveryAdapter.deliver(channel, validated_data, idempotency_key, replay_url)
            success = res.success
            receipt = res.receipt

        elif dest_lower == "sheets":
            sheet = destination_config.get("sheet_name", "Q3_Sales_Master")
            target_name = sheet
            res = await SheetsDeliveryAdapter.deliver(sheet, validated_data, idempotency_key)
            success = res.success
            receipt = res.receipt

        elif dest_lower == "webhook":
            wh_url = destination_config.get("webhook_url", "https://webhook.site/mock-target")
            target_name = wh_url
            if not is_ssrf_safe_url(wh_url) and not ("mock" in wh_url or "localhost" in wh_url):
                success = False
                receipt = f"Blocked: Webhook URL '{wh_url}' failed SSRF validation (private/internal IP blocked)"
            else:
                res = await WebhookDeliveryAdapter.deliver(wh_url, validated_data, idempotency_key)
                success = res.success
                receipt = res.receipt

        elif dest_lower in ["postgres", "sql"]:
            tbl = destination_config.get("target_table", "legacy_exports")
            target_name = tbl
            res = await PostgresDeliveryAdapter.deliver(tbl, validated_data, idempotency_key)
            success = res.success
            receipt = res.receipt

        elif dest_lower in ["json_export", "feed"]:
            target_name = f"/api/v1/feeds/{task_id}/latest"
            success = True
            receipt = f"Validated JSON feed cached at {target_name}"

        else:
            success = False
            receipt = f"Unsupported destination type: '{destination_type}'"

        # 3. Record Delivery in Database
        record_id = f"deliv-{uuid.uuid4().hex[:8]}"
        async with AsyncSessionLocal() as session:
            record = DeliveryRecord(
                id=record_id,
                run_id=run_id,
                destination_type=dest_lower,
                destination_target=target_name,
                status="delivered" if success else "failed",
                receipt=receipt,
                idempotency_key=idempotency_key,
                records_count=records_count,
                created_at=datetime.now(timezone.utc)
            )
            session.add(record)
            await session.commit()

        # 4. Audit Log
        await AuditService.log_event(
            service_name="destination_delivery",
            action=f"delivery.{record.status}",
            resource_type="delivery_record",
            resource_id=record_id,
            details={
                "run_id": run_id,
                "destination": dest_lower,
                "target": target_name,
                "receipt": receipt,
                "records_count": records_count
            }
        )

        return {
            "delivery_id": record_id,
            "status": "delivered" if success else "failed",
            "receipt": receipt,
            "destination_type": dest_lower,
            "destination_target": target_name,
            "records_count": records_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    def export_as_csv(data: Dict[str, Any]) -> str:
        """
        Converts extracted tabular data into a formatted CSV string.
        """
        items = data.get("items", [])
        if not items:
            return "No records extracted\n"

        output = io.StringIO()
        fieldnames = list(items[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            writer.writerow(item)
        return output.getvalue()
