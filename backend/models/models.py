import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# =============================================================================
# SERVICE 3: TASK & PLANNING DATA MODELS
# =============================================================================
class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    goal = Column(Text, nullable=False)
    schema_definition = Column(JSON, nullable=False)
    portal_url = Column(String(512), nullable=False, default="http://localhost:8080")
    credential_id = Column(String(64), nullable=True)
    destination_types = Column(JSON, nullable=False, default=list) # e.g. ["slack", "feed"]
    destination_config = Column(JSON, nullable=False, default=dict)
    schedule_cron = Column(String(64), nullable=True)
    schedule_human = Column(String(128), nullable=True)
    is_write_action = Column(Boolean, default=False)
    risk_level = Column(String(32), default="LOW") # LOW, MEDIUM, HIGH
    requires_approval = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    runs = relationship("Run", back_populates="task", cascade="all, delete-orphan")
    versions = relationship("TaskVersion", back_populates="task", cascade="all, delete-orphan")


class TaskVersion(Base):
    __tablename__ = "task_versions"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    version_number = Column(Integer, nullable=False, default=1)
    prompt = Column(Text, nullable=False)
    goal = Column(Text, nullable=False)
    schema_definition = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    change_summary = Column(String(255), default="Task updated")

    task = relationship("Task", back_populates="versions")


# =============================================================================
# SERVICE 4: ORCHESTRATION & SCHEDULER DATA MODELS
# =============================================================================
class Run(Base):
    __tablename__ = "runs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    status = Column(String(32), default="queued") # queued, planning, signing_in, navigating, extracting, validating, needs_approval, needs_review, delivering, succeeded, failed, cancelled
    trigger_type = Column(String(32), default="manual") # manual, scheduled, api
    extracted_data = Column(JSON, nullable=True)
    validated_data = Column(JSON, nullable=True)
    validation_report = Column(JSON, nullable=True) # { valid: bool, score: float, anomalies: [], errors: [] }
    replay_url = Column(String(512), nullable=True)
    time_saved_minutes = Column(Float, default=120.0) # Estimated manual hours saved
    error_message = Column(Text, nullable=True)
    idempotency_key = Column(String(128), unique=True, nullable=False, default=generate_uuid)
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="runs")
    steps = relationship("RunStep", back_populates="run", cascade="all, delete-orphan", order_by="RunStep.timestamp")
    approval = relationship("Approval", back_populates="run", uselist=False, cascade="all, delete-orphan")
    delivery_records = relationship("DeliveryRecord", back_populates="run", cascade="all, delete-orphan")


class RunStep(Base):
    __tablename__ = "run_steps"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False)
    step_name = Column(String(64), nullable=False) # planning, signing_in, navigating, extracting, validating, approval_gate, delivering, completed
    status = Column(String(32), default="in_progress") # in_progress, completed, failed, skipped
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utc_now)

    run = relationship("Run", back_populates="steps")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False, unique=True)
    action_type = Column(String(64), nullable=False) # e.g. WRITE_MUTATION_GATE, update_reorder_level
    current_payload = Column(JSON, nullable=True)
    proposed_payload = Column(JSON, nullable=False)
    status = Column(String(32), default="pending") # pending, approved, rejected
    decision_by = Column(String(128), nullable=True)
    decision_at = Column(DateTime, nullable=True)
    comments = Column(Text, nullable=True)

    run = relationship("Run", back_populates="approval")


# =============================================================================
# SERVICE 2: IDENTITY, VAULT AND CONFIGURATION DATA MODELS
# =============================================================================
class CredentialVault(Base):
    __tablename__ = "credentials"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    portal_domain = Column(String(255), nullable=False)
    username_masked = Column(String(64), nullable=False)
    encrypted_secret = Column(String(255), nullable=False)
    auth_type = Column(String(32), default="form_login") # form_login, basic_auth, cookie_session, api_token
    created_at = Column(DateTime, default=utc_now)
    last_used_at = Column(DateTime, nullable=True)


class AuthorizedDomain(Base):
    __tablename__ = "authorized_domains"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    domain = Column(String(255), unique=True, nullable=False) # e.g. localhost, 127.0.0.1, internal-erp.acme.corp
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


# =============================================================================
# SERVICE 6: RELIABILITY AND SAFETY ENGINE DATA MODELS
# =============================================================================
class DriftBaseline(Base):
    __tablename__ = "drift_baselines"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), nullable=False)
    version = Column(Integer, default=1)
    url = Column(String(512), nullable=False)
    dom_signature = Column(JSON, nullable=False) # { selectors: {}, fields: [], table_headers: [] }
    payload_schema = Column(JSON, nullable=False)
    sample_record = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class DriftFinding(Base):
    __tablename__ = "drift_findings"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), nullable=False)
    run_id = Column(String(64), nullable=True)
    finding_type = Column(String(64), nullable=False) # missing_element, changed_label, schema_drift, selector_ambiguity
    severity = Column(String(32), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    field_name = Column(String(128), nullable=True)
    baseline_value = Column(Text, nullable=True)
    detected_value = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    proposed_repair = Column(JSON, nullable=True)
    repair_status = Column(String(32), default="detected") # detected, repaired, rejected, requires_review
    created_at = Column(DateTime, default=utc_now)


class TwinComparison(Base):
    __tablename__ = "twin_comparisons"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), nullable=False)
    legacy_run_id = Column(String(64), nullable=False)
    target_service_url = Column(String(512), nullable=False)
    parity_score = Column(Float, nullable=False) # 0.0 to 100.0
    field_diffs = Column(JSON, nullable=False, default=list) # [{ field, legacy, target, match: bool }]
    business_rules_passed = Column(Boolean, default=True)
    readiness_status = Column(String(32), default="READY") # READY, GATED, BLOCKED
    created_at = Column(DateTime, default=utc_now)


class SecurityFinding(Base):
    __tablename__ = "security_findings"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), nullable=True)
    task_id = Column(String(64), nullable=True)
    rule_id = Column(String(64), nullable=False) # SEC-SSRF-01, SEC-AUTH-DOMAIN, SEC-WRITE-UNAPPROVED, SEC-SECRET-LEAK
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    evidence = Column(JSON, nullable=True)
    remediation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class ConfidenceGateDecision(Base):
    __tablename__ = "confidence_decisions"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), nullable=False)
    confidence_score = Column(Float, nullable=False) # 0.0 to 100.0
    schema_score = Column(Float, nullable=False)
    completeness_score = Column(Float, nullable=False)
    drift_score = Column(Float, nullable=False)
    selector_score = Column(Float, nullable=False)
    decision = Column(String(32), nullable=False) # PASS, REVIEW_REQUIRED, REJECT
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)


# =============================================================================
# SERVICE 7: DESTINATION DELIVERY DATA MODELS
# =============================================================================
class DeliveryRecord(Base):
    __tablename__ = "delivery_records"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False)
    destination_type = Column(String(32), nullable=False) # slack, sheets, webhook, postgres, json_export
    destination_target = Column(String(512), nullable=False)
    status = Column(String(32), default="delivered") # delivered, failed, skipped
    receipt = Column(Text, nullable=False)
    idempotency_key = Column(String(128), unique=True, nullable=False)
    records_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    run = relationship("Run", back_populates="delivery_records")


# =============================================================================
# SERVICE 8: EVIDENCE, AUDIT AND REPORTING DATA MODELS
# =============================================================================
class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    correlation_id = Column(String(64), nullable=False, default=generate_uuid)
    actor = Column(String(128), nullable=False, default="system")
    service_name = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False) # task.created, run.started, delivery.completed, etc.
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(64), nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=utc_now)


class StoredReport(Base):
    __tablename__ = "stored_reports"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    report_type = Column(String(64), default="RUN_SUMMARY") # RUN_SUMMARY, PARITY_AUDIT, DRIFT_EVIDENCE, SECURITY_AUDIT
    run_id = Column(String(64), nullable=True)
    task_id = Column(String(64), nullable=True)
    format = Column(String(16), default="json") # json, html, pdf
    content = Column(Text, nullable=False)
    evidence_links = Column(JSON, nullable=True) # [replay_url, screenshots]
    generated_at = Column(DateTime, default=utc_now)


# =============================================================================
# FEED CACHE MODEL (HERO API)
# =============================================================================
class FeedCache(Base):
    __tablename__ = "feed_cache"

    task_id = Column(String(64), primary_key=True)
    latest_run_id = Column(String(64), nullable=False)
    data = Column(JSON, nullable=False)
    item_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=utc_now)
