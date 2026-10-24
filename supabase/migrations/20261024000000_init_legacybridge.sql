-- LegacyBridge Supabase PostgreSQL Schema Migration
-- HackIIITD 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    goal TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT 'http://localhost:8080',
    expected_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    destination_type TEXT NOT NULL DEFAULT 'slack',
    destination_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    schedule_cron TEXT,
    schedule_human TEXT,
    is_write_action BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- 2. Runs Table
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    execution_mode TEXT NOT NULL DEFAULT 'demo' CHECK (execution_mode IN ('real', 'demo')),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'validating', 'delivering', 'succeeded', 'failed', 'validation_failed', 'needs_approval')),
    extracted_data JSONB,
    validated_data JSONB,
    validation_report JSONB,
    tinyfish_run_id TEXT,
    replay_url TEXT,
    delivery_status TEXT DEFAULT 'pending',
    error_message TEXT,
    time_saved_minutes NUMERIC(6, 2) DEFAULT 120.00,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_runs_task_id ON runs(task_id);
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);

-- 3. Run Events Table
CREATE TABLE IF NOT EXISTS run_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_run_events_run_id ON run_events(run_id);
CREATE INDEX IF NOT EXISTS idx_run_events_created_at ON run_events(created_at ASC);

-- 4. Integration Configurations Table
CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('tinyfish', 'slack', 'google_sheets')),
    config_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_connected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_provider UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integration_configs(user_id);

-- 5. Delivery Attempts Table
CREATE TABLE IF NOT EXISTS delivery_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed')),
    receipt TEXT NOT NULL,
    response_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_attempts_run_id ON delivery_attempts(run_id);

-- 6. Row Level Security Policies (Enforced on Supabase)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_attempts ENABLE ROW LEVEL SECURITY;

-- Note: When accessed via server-side service client, ownership checks are strictly enforced in application code.
