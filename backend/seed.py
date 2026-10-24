import asyncio
import json
from datetime import datetime, timedelta
from backend.database import init_db, AsyncSessionLocal
from backend.models.models import Task, Run, RunStep, CredentialVault, FeedCache, Approval

SAMPLE_SCHEMA = {
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
                    "revenue": {"type": "number", "minimum": 0}
                }
            }
        },
        "total_revenue": {"type": "number"}
    },
    "required": ["report_title", "items", "total_revenue"]
}

SAMPLE_EXTRACTED_DATA = {
    "report_title": "Acme Inventory Q3 Regional Sales Performance",
    "period": "Q3 2026",
    "items": [
        {"region": "North America", "sku": "ACM-8812", "product_name": "UltraSensor Pro", "units_sold": 4120, "revenue": 103000.0},
        {"region": "Europe West", "sku": "ACM-9941", "product_name": "HydraValves X", "units_sold": 2840, "revenue": 85200.0},
        {"region": "Asia Pacific", "sku": "ACM-4410", "product_name": "OptiRelay 400", "units_sold": 6190, "revenue": 154750.0},
        {"region": "Latin America", "sku": "ACM-2298", "product_name": "MicroActuator G2", "units_sold": 1340, "revenue": 33500.0},
        {"region": "Middle East", "sku": "ACM-1104", "product_name": "ThermalFuse Max", "units_sold": 950, "revenue": 28500.0}
    ],
    "total_revenue": 404950.0
}

async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as session:
        # 1. Seed Credential in Vault
        vault_cred = CredentialVault(
            id="cred-acme-admin",
            name="Acme ERP Production Vault Ref",
            portal_domain="localhost:8080",
            username_masked="ops_ad***@acmecorp.internal",
            encrypted_secret="vault_enc_a9f182c890123be",
            auth_type="form_login",
            last_used_at=datetime.utcnow() - timedelta(minutes=45)
        )
        session.add(vault_cred)

        # 2. Seed Hero Task 1: Q3 Sales Extraction
        task_sales = Task(
            id="task-q3-sales",
            name="Q3 Regional Sales Extraction & Ops Report",
            prompt="Open the inventory portal, pull Q3 sales by region and post the table to #ops-reports.",
            goal="Sign in to Acme Inventory v4.2 ERP using Vault credentials, navigate through Reports > Q3 Sales table, paginate through all rows, validate against schema, and dispatch formatted markdown to Slack #ops-reports.",
            schema_definition=SAMPLE_SCHEMA,
            portal_url="http://localhost:8080",
            credential_id=vault_cred.id,
            destination_types=["slack", "feed"],
            destination_config={"slack_channel": "#ops-reports", "feed_slug": "q3-sales"},
            schedule_cron="0 7 * * 1-5",
            schedule_human="Every weekday at 7:30 AM",
            is_write_action=False
        )
        session.add(task_sales)

        # 3. Seed Task 2: Write Action requiring Approval
        task_reorder = Task(
            id="task-reorder-update",
            name="Adjust Safety Stock Reorder Thresholds",
            prompt="Scan Acme Inventory low-stock alerts and bump reorder threshold for ACM-8812 to 500 units.",
            goal="Locate SKU ACM-8812 in Acme Inventory catalog, verify current threshold, and submit write action to update to 500 units pending operator sign-off.",
            schema_definition={"type": "object", "properties": {"sku": {"type": "string"}, "old_threshold": {"type": "integer"}, "new_threshold": {"type": "integer"}}},
            portal_url="http://localhost:8080",
            credential_id=vault_cred.id,
            destination_types=["slack"],
            destination_config={"slack_channel": "#inventory-alerts"},
            schedule_cron=None,
            schedule_human="On-demand manual trigger",
            is_write_action=True
        )
        session.add(task_reorder)

        # 4. Seed Historical Succeeded Run for Hero Task
        run_hist = Run(
            id="run-q3-recent-001",
            task_id=task_sales.id,
            status="succeeded",
            trigger_type="scheduled",
            extracted_data=SAMPLE_EXTRACTED_DATA,
            validated_data=SAMPLE_EXTRACTED_DATA,
            validation_report={
                "valid": True,
                "score": 100.0,
                "anomalies": [],
                "errors": [],
                "checks": [
                    {"name": "Pydantic Schema Validation", "passed": True, "detail": "All required keys matched"},
                    {"name": "Row Count Non-Zero", "passed": True, "detail": "5 records extracted"},
                    {"name": "Null Value Percentage", "passed": True, "detail": "0.0% nulls (threshold < 5%)"},
                    {"name": "Historical Drift Baseline", "passed": True, "detail": "Total revenue +4.2% within 15% tolerance"}
                ]
            },
            replay_url="https://agent.tinyfish.ai/replays/rf-demo-q3-acme-78192a",
            time_saved_minutes=120.0,
            idempotency_key="idem-q3-recent-001",
            started_at=datetime.utcnow() - timedelta(hours=2, minutes=5),
            completed_at=datetime.utcnow() - timedelta(hours=2)
        )
        session.add(run_hist)

        # Seed steps for historical run
        step_names = [
            ("planning", "completed", "LangChain Planner decomposed prompt into navigation goal and Pydantic schema."),
            ("signing_in", "completed", "TinyFish retrieved Vault credentials and completed Acme ERP SSO form."),
            ("navigating", "completed", "Navigated frameset: Reports -> Sales -> Q3 Regional Matrix."),
            ("extracting", "completed", "Traversed pagination across 2 pages; harvested 5 row objects."),
            ("validating", "completed", "Pydantic validation passed (score: 100%). No anomalies detected."),
            ("delivering", "completed", "Dispatched formatted block table to Slack channel #ops-reports with idempotency key idem-q3-recent-001.")
        ]
        t = datetime.utcnow() - timedelta(hours=2, minutes=5)
        for s_name, s_status, s_msg in step_names:
            step = RunStep(
                run_id=run_hist.id,
                step_name=s_name,
                status=s_status,
                message=s_msg,
                timestamp=t
            )
            session.add(step)
            t += timedelta(seconds=12)

        # 5. Seed an Approval Request for the Write Task
        run_approval = Run(
            id="run-reorder-002",
            task_id=task_reorder.id,
            status="needs_approval",
            trigger_type="manual",
            extracted_data={"sku": "ACM-8812", "old_threshold": 150, "new_threshold": 500},
            validated_data={"sku": "ACM-8812", "old_threshold": 150, "new_threshold": 500},
            validation_report={"valid": True, "score": 95.0, "anomalies": ["Threshold increase +233% exceeds standard 50% delta."], "errors": []},
            replay_url="https://agent.tinyfish.ai/replays/rf-demo-reorder-write-341",
            time_saved_minutes=45.0,
            idempotency_key="idem-reorder-002",
            started_at=datetime.utcnow() - timedelta(minutes=15)
        )
        session.add(run_approval)

        approval_item = Approval(
            id="appr-001",
            run_id=run_approval.id,
            action_type="UPDATE_REORDER_LEVEL",
            current_payload={"sku": "ACM-8812", "reorder_level": 150, "warehouse": "Central Depot"},
            proposed_payload={"sku": "ACM-8812", "reorder_level": 500, "warehouse": "Central Depot"},
            status="pending"
        )
        session.add(approval_item)

        # 6. Seed Feed Cache
        feed = FeedCache(
            task_id=task_sales.id,
            latest_run_id=run_hist.id,
            data=SAMPLE_EXTRACTED_DATA,
            item_count=5,
            last_updated=datetime.utcnow() - timedelta(hours=2)
        )
        session.add(feed)

        await session.commit()
        print("Database initialized and seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
