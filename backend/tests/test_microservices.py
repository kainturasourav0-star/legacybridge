import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database import init_db
from backend.seed import seed_data
from backend.services.safety_engine import SafetyEngineService
from backend.services.identity_vault import IdentityVaultService
from backend.services.delivery_service import DestinationDeliveryService
from backend.services.audit_service import AuditService
from backend.services.task_planning import TaskPlanningService
from backend.services.orchestrator import OrchestrationEngine

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()
    await seed_data()

@pytest.mark.asyncio
async def test_service_1_api_gateway_health():
    """Service 1: Verifies /health/services reports all 8 microservices status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/health/services")
        assert res.status_code == 200
        data = res.json()
        assert "gateway" in data
        assert "identity_vault" in data
        assert "task_planning" in data
        assert "orchestration" in data
        assert "browser_agent" in data
        assert "safety_engine" in data
        assert "delivery_service" in data
        assert "audit_reporting" in data

@pytest.mark.asyncio
async def test_dual_ai_orchestration_nvidia_and_openai():
    """Tests Dual AI Workflow Orchestration utilizing NVIDIA NIM and OpenAI in tandem."""
    from backend.adapters.llm_planner import get_llm_planner, DualAIWorkflowOrchestrator
    planner = get_llm_planner()
    res = await planner.plan_task(
        prompt="Retrieve Q3 sales ledger and post to Slack #finance",
        portal_url="http://localhost:8080"
    )
    assert "goal" in res
    assert "schema_definition" in res
    assert "ai_providers" in res
    assert "strategy_engine" in res["ai_providers"] or "strategy" in res["ai_providers"]

@pytest.mark.asyncio
async def test_service_2_identity_vault_and_domain_allowlist():
    """Service 2: Tests vault secret masking and domain allowlist enforcement."""
    # Test secret masking
    cred = await IdentityVaultService.add_credential(
        name="ERP System Credentials",
        portal_domain="internal-erp.acme.corp",
        username="admin_lead@acme.corp",
        secret="super-confidential-password-123"
    )
    assert cred["username_masked"] == "ad***@acme.corp"
    assert "super-confidential-password-123" not in str(cred)

    # Test domain allowlist
    assert await IdentityVaultService.is_domain_authorized("localhost") is True
    assert await IdentityVaultService.is_domain_authorized("http://localhost:8080/reports") is True
    assert await IdentityVaultService.is_domain_authorized("https://unauthorized-attacker.xyz") is False

@pytest.mark.asyncio
async def test_service_3_task_planning_and_versioning():
    """Service 3: Tests natural language planning, validation, task creation, and versioning."""
    # Natural language plan
    plan = await TaskPlanningService.plan_from_natural_language(
        prompt="Pull Q3 sales by region and post to #ops-reports",
        portal_url="http://localhost:8080"
    )
    assert "goal" in plan
    assert plan["risk_level"] == "LOW"
    assert plan["requires_approval"] is False

    # Unauthorized domain plan should be rejected
    with pytest.raises(PermissionError):
        await TaskPlanningService.plan_from_natural_language(
            prompt="Scrape data",
            portal_url="https://darkweb-phishing.org"
        )

    # Task creation & initial version
    task = await TaskPlanningService.create_task(
        name="Automated Q3 Sales Task",
        prompt="Pull regional sales",
        goal="Extract regional table",
        schema_definition={"type": "object", "required": ["items"]},
        portal_url="http://localhost:8080"
    )
    assert task["version"] == 1

    # Task duplication
    dup = await TaskPlanningService.duplicate_task(task["id"])
    assert dup["name"] == "Automated Q3 Sales Task (Copy)"

@pytest.mark.asyncio
async def test_service_6_safety_engine_validation():
    """Service 6: Validates valid payload, null ratios, and empty row rejection."""
    # Valid payload
    valid_data = {
        "items": [
            {"region": "North America", "revenue": 145000.0},
            {"region": "Europe West", "revenue": 112000.0}
        ]
    }
    schema = {"required": ["items"]}
    rep = SafetyEngineService.validate_dataset(valid_data, schema)
    assert rep["valid"] is True
    assert rep["score"] >= 80.0

    # High null ratio rejected
    null_data = {
        "items": [
            {"region": None, "revenue": None, "sku": ""},
            {"region": "Europe", "revenue": None, "sku": "N/A"}
        ]
    }
    rep_null = SafetyEngineService.validate_dataset(null_data, schema)
    assert any("null field ratio" in anom.lower() for anom in rep_null["anomalies"])

@pytest.mark.asyncio
async def test_service_6_drift_detection_and_repair_policy():
    """Service 6: Tests DOM drift detection and ambiguous vs unique repair policy."""
    task_id = "test-task-drift-01"

    # 1. First run creates baseline
    base_dom = {
        "url": "http://localhost:8080",
        "selectors": {"sales_table": "#report-table-v1", "next_btn": "button.page-next"},
        "labels": {"revenue_col": "Gross Revenue"}
    }
    findings_1 = await SafetyEngineService.detect_dom_and_schema_drift(task_id, base_dom, {"required": ["items"]})
    assert len(findings_1) == 0  # Initial baseline created

    # 2. Second run has changed label and missing selector
    drifted_dom = {
        "url": "http://localhost:8080",
        "selectors": {"next_btn": "button.page-next"}, # missing sales_table
        "labels": {"revenue_col": "Net Total (USD)"}   # changed label
    }
    findings_2 = await SafetyEngineService.detect_dom_and_schema_drift(task_id, drifted_dom, {"required": ["items"]})
    assert len(findings_2) >= 2
    types = [f["type"] for f in findings_2]
    assert "missing_element" in types
    assert "changed_label" in types

    # 3. Policy Enforcement: Unique repair candidate APPROVED
    appr, cand, expl = SafetyEngineService.evaluate_repair_candidate(["#report-table-v2"])
    assert appr is True
    assert cand == "#report-table-v2"

    # 4. Policy Enforcement: Ambiguous repair candidates BLOCKED
    appr_amb, cand_amb, expl_amb = SafetyEngineService.evaluate_repair_candidate(["#table-1", "#table-2", ".sales-grid"])
    assert appr_amb is False
    assert cand_amb is None
    assert "Ambiguous recovery candidate" in expl_amb

@pytest.mark.asyncio
async def test_service_6_confidence_gate_formula():
    """Service 6: Tests explainable confidence score calculation and risk thresholds."""
    # High score -> PASS
    high_val = {"score": 95.0, "errors": [], "anomalies": []}
    gate_pass = await SafetyEngineService.evaluate_confidence_gate("run-gate-test-1", high_val, has_ambiguity=False, has_drift=False)
    assert gate_pass["decision"] == "PASS"
    assert gate_pass["confidence_score"] >= 85.0

    # Ambiguity present -> REVIEW_REQUIRED or REJECT
    gate_amb = await SafetyEngineService.evaluate_confidence_gate("run-gate-test-2", high_val, has_ambiguity=True, has_drift=True)
    assert gate_amb["decision"] in ["REVIEW_REQUIRED", "REJECT"]

@pytest.mark.asyncio
async def test_service_6_safety_twin_parity_comparison():
    """Service 6: Tests field-by-field parity comparison between legacy and modern service."""
    legacy = {
        "total_revenue": 404950.0,
        "items": [
            {"region": "North America", "revenue": 145000.0},
            {"region": "Europe West", "revenue": 112000.0}
        ]
    }
    # Target service with exact parity
    target_match = {
        "total_revenue": 404950.0,
        "items": [
            {"region": "North America", "revenue": 145000.0},
            {"region": "Europe West", "revenue": 112000.0}
        ]
    }
    twin_res = await SafetyEngineService.compare_safety_twin(
        task_id="task-twin-test",
        legacy_run_id="run-leg-1",
        legacy_payload=legacy,
        target_payload=target_match
    )
    assert twin_res["parity_score"] == 100.0
    assert twin_res["readiness_status"] == "READY"

@pytest.mark.asyncio
async def test_service_7_destination_delivery_and_idempotency():
    """Service 7: Tests Slack delivery, idempotency key deduplication, and SSRF blocking."""
    payload = {"report_title": "Q3 Sales", "items": [{"region": "NA", "revenue": 1000}], "total_revenue": 1000}
    idem_key = "idem-test-delivery-key-999"

    # First delivery
    res_1 = await DestinationDeliveryService.deliver_payload(
        run_id="run-deliv-test",
        task_id="task-deliv-test",
        destination_type="slack",
        destination_config={"slack_channel": "#ops-test"},
        validated_data=payload,
        idempotency_key=idem_key
    )
    assert res_1["status"] == "delivered"

    # Second delivery with same idempotency key must be deduplicated
    res_2 = await DestinationDeliveryService.deliver_payload(
        run_id="run-deliv-test",
        task_id="task-deliv-test",
        destination_type="slack",
        destination_config={"slack_channel": "#ops-test"},
        validated_data=payload,
        idempotency_key=idem_key
    )
    assert "Idempotent" in res_2["receipt"]

    # SSRF Protection: Private subnet webhook blocked
    res_ssrf = await DestinationDeliveryService.deliver_payload(
        run_id="run-deliv-test",
        task_id="task-deliv-test",
        destination_type="webhook",
        destination_config={"webhook_url": "http://192.168.1.50/admin-dump"},
        validated_data=payload,
        idempotency_key="idem-ssrf-block-1"
    )
    assert res_ssrf["status"] == "failed"
    assert "SSRF" in res_ssrf["receipt"]

@pytest.mark.asyncio
async def test_service_8_audit_trail_and_report_generation():
    """Service 8: Tests immutable audit event logging, secret redaction, and report generation."""
    # Audit log with sensitive key redaction
    event = await AuditService.log_event(
        service_name="identity_vault",
        action="credentials.added",
        resource_type="credential",
        resource_id="cred-test-audit-1",
        actor="lead_ops",
        details={"portal": "internal-erp", "api_key": "sk-secret-token-12345"}
    )
    assert event.details["api_key"] == "[REDACTED_SECRET]"
    assert event.details["portal"] == "internal-erp"

    # Audit trail query
    trail = await AuditService.get_audit_trail(service_name="identity_vault", limit=10)
    assert len(trail) > 0

    # Create explicit test run for report testing with unique IDs
    import uuid
    from backend.models.models import Task, Run
    from backend.database import AsyncSessionLocal
    from datetime import datetime, timezone
    uid_str = uuid.uuid4().hex[:8]
    t_id = f"task-rep-{uid_str}"
    r_id = f"run-rep-{uid_str}"

    async with AsyncSessionLocal() as session:
        t = Task(
            id=t_id,
            name="Report Generation Task",
            prompt="Test prompt",
            goal="Test goal",
            schema_definition={"type": "object"},
            portal_url="http://localhost:8080"
        )
        session.add(t)
        r = Run(
            id=r_id,
            task_id=t_id,
            status="succeeded",
            extracted_data={"items": [{"region": "NA", "revenue": 50000}]},
            validated_data={"items": [{"region": "NA", "revenue": 50000}]},
            validation_report={"valid": True, "score": 98.0},
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc)
        )
        session.add(r)
        await session.commit()

    # HTML and JSON Report generation
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rep_res = await client.get(f"/api/v1/reports/{r_id}")
        assert rep_res.status_code == 200
        assert "execution_summary" in rep_res.json()

        rep_html = await client.get(f"/api/v1/reports/{r_id}/html")
        assert rep_html.status_code == 200
        assert "text/html" in rep_html.headers.get("content-type", "")
        assert "LegacyBridge Intelligence & Modernization Report" in rep_html.text
