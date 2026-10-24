export type ExecutionMode = 'real' | 'demo';

export type RunStatus =
  | 'queued'
  | 'running'
  | 'validating'
  | 'delivering'
  | 'succeeded'
  | 'failed'
  | 'validation_failed'
  | 'needs_approval';

export interface Task {
  id: string;
  userId: string;
  name: string;
  prompt: string;
  goal: string;
  sourceUrl: string;
  expectedSchema: Record<string, any>;
  destinationType: 'slack' | 'sheets' | 'csv' | 'webhook' | 'postgres';
  destinationConfig: {
    slackChannel?: string;
    sheetName?: string;
    webhookUrl?: string;
    targetTable?: string;
  };
  scheduleCron?: string | null;
  scheduleHuman?: string | null;
  isWriteAction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RunEvent {
  id: string;
  runId: string;
  eventType: string;
  status: 'in_progress' | 'completed' | 'failed';
  message: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ValidationReport {
  valid: boolean;
  score: number;
  anomalies: string[];
  errors: string[];
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
}

export interface Run {
  id: string;
  taskId: string;
  userId: string;
  executionMode: ExecutionMode;
  status: RunStatus;
  extractedData?: Record<string, any> | null;
  validatedData?: Record<string, any> | null;
  validationReport?: ValidationReport | null;
  tinyfishRunId?: string | null;
  replayUrl?: string | null;
  deliveryStatus?: string;
  errorMessage?: string | null;
  timeSavedMinutes: number;
  startedAt: string;
  completedAt?: string | null;
  events?: RunEvent[];
}

export interface IntegrationConfig {
  id: string;
  userId: string;
  provider: 'tinyfish' | 'slack' | 'google_sheets';
  configMetadata: {
    apiKeyConfigured?: boolean;
    webhookConfigured?: boolean;
    serviceAccountConfigured?: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'disconnected' | 'demo_mode';
  };
  isConnected: boolean;
  createdAt: string;
  updatedAt: string;
}
