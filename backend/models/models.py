import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    runs = relationship("Run", back_populates="task", cascade="all, delete-orphan")

class Run(Base):
    __tablename__ = "runs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    status = Column(String(32), default="queued") # queued, planning, signing_in, navigating, extracting, validating, needs_approval, needs_review, delivering, succeeded, failed
    trigger_type = Column(String(32), default="manual") # manual, scheduled, api
    extracted_data = Column(JSON, nullable=True)
    validated_data = Column(JSON, nullable=True)
    validation_report = Column(JSON, nullable=True) # { valid: bool, score: float, anomalies: [], errors: [] }
    replay_url = Column(String(512), nullable=True)
    time_saved_minutes = Column(Float, default=120.0) # Estimated manual hours saved
    error_message = Column(Text, nullable=True)
    idempotency_key = Column(String(128), unique=True, nullable=False, default=generate_uuid)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="runs")
    steps = relationship("RunStep", back_populates="run", cascade="all, delete-orphan", order_by="RunStep.timestamp")
    approval = relationship("Approval", back_populates="run", uselist=False, cascade="all, delete-orphan")

class RunStep(Base):
    __tablename__ = "run_steps"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False)
    step_name = Column(String(64), nullable=False) # planning, signing_in, navigating, extracting, validating, approval_gate, delivering, completed
    status = Column(String(32), default="in_progress") # in_progress, completed, failed, skipped
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    run = relationship("Run", back_populates="steps")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False, unique=True)
    action_type = Column(String(64), nullable=False) # e.g. update_reorder_level
    current_payload = Column(JSON, nullable=True)
    proposed_payload = Column(JSON, nullable=False)
    status = Column(String(32), default="pending") # pending, approved, rejected
    decision_by = Column(String(128), nullable=True)
    decision_at = Column(DateTime, nullable=True)
    comments = Column(Text, nullable=True)

    run = relationship("Run", back_populates="approval")

class CredentialVault(Base):
    __tablename__ = "credentials"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    portal_domain = Column(String(255), nullable=False)
    username_masked = Column(String(64), nullable=False)
    encrypted_secret = Column(String(255), nullable=False)
    auth_type = Column(String(32), default="form_login") # form_login, basic_auth, cookie_session, api_token
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)

class FeedCache(Base):
    __tablename__ = "feed_cache"

    task_id = Column(String(64), primary_key=True)
    latest_run_id = Column(String(64), nullable=False)
    data = Column(JSON, nullable=False)
    item_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
