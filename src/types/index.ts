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

// ==========================================
// LEGACYBRIDGE MODERNIZATION PLATFORM TYPES
// ==========================================

export interface Project {
  id: string;
  name: string;
  description: string;
  sourceType: 'archive_upload' | 'github_repo' | 'sample_monolith';
  repoUrl?: string;
  branch?: string;
  primaryLanguage: string;
  detectedFramework: string;
  totalFiles: number;
  linesOfCode: number;
  status: 'imported' | 'analyzing' | 'analyzed' | 'migrating' | 'verified';
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  title: string;
  category: 'security' | 'architecture' | 'technical_debt' | 'coupling' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  evidence: string;
  explanation: string;
  confidence: number;
  remediation: string;
  status: 'open' | 'reviewed' | 'resolved';
}

export interface ModuleNode {
  id: string;
  name: string;
  type: 'controller' | 'service' | 'model' | 'utility' | 'database' | 'external_api';
  filePath: string;
  linesOfCode: number;
  couplingScore: number;
  candidateService?: string;
  dependencies: string[];
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  type: 'calls' | 'imports' | 'queries' | 'inferred';
  callCount: number;
  isCrossBoundary: boolean;
}

export interface BusinessRule {
  id: string;
  name: string;
  domain: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  conditionExpression: string;
  outcomeExpression: string;
  rawSnippet: string;
  isDeterministic: boolean;
  confidence: number;
  ruleCategory: 'pricing' | 'eligibility' | 'validation' | 'tax_calculation' | 'workflow';
  parameters: Array<{ name: string; type: string; defaultValue?: string }>;
}

export interface ServiceCandidate {
  id: string;
  name: string;
  domain: string;
  responsibility: string;
  modules: string[];
  proposedEndpoints: Array<{ method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; summary: string }>;
  dataOwnership: string[];
  dependencies: string[];
  communicationType: 'synchronous_rest' | 'asynchronous_event' | 'grpc';
  cohesionScore: number;
  couplingScore: number;
  migrationOrder: number;
  migrationRisks: string[];
}

export interface MigrationPhase {
  phaseNumber: number;
  title: string;
  strategy: 'strangler_fig' | 'database_first' | 'service_extraction' | 'cutover';
  services: string[];
  deliverables: string[];
  prerequisites: string[];
  rollbackTrigger: string;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
}

export interface MigrationPlan {
  id: string;
  projectId: string;
  title: string;
  targetArchitecture: 'modular_monolith' | 'microservices' | 'serverless_functions';
  summary: string;
  phases: MigrationPhase[];
  riskRegister: Array<{ risk: string; severity: 'high' | 'medium' | 'low'; mitigation: string }>;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ServiceScaffold {
  id: string;
  serviceId: string;
  serviceName: string;
  language: 'typescript' | 'python';
  framework: 'express' | 'fastapi' | 'nestjs';
  files: Array<{
    path: string;
    content: string;
    description: string;
    hasTodoNotice: boolean;
  }>;
  openApiSpec: string;
  dockerfile: string;
  createdAt: string;
}

export type DriftStatus = 'MATCH' | 'CHANGED' | 'MISSING' | 'ADDED' | 'INCONCLUSIVE';

export interface DriftItem {
  id: string;
  ruleId: string;
  ruleName: string;
  domain: string;
  status: DriftStatus;
  originalSnippet: string;
  originalFile: string;
  originalLines: string;
  modernizedSnippet?: string;
  modernizedFile?: string;
  modernizedLines?: string;
  detectedDifference: string;
  businessImpact: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  recommendedAction: string;
}

export interface RegressionTestCase {
  id: string;
  driftItemId: string;
  testName: string;
  inputPayload: Record<string, any>;
  expectedOutput: Record<string, any>;
  actualMonolithOutput?: Record<string, any>;
  actualModernOutput?: Record<string, any>;
  passed: boolean;
  executionTimeMs: number;
  failureReason?: string;
}

export interface DriftAnalysis {
  id: string;
  projectId: string;
  totalRulesAnalyzed: number;
  matchesCount: number;
  changedCount: number;
  missingCount: number;
  addedCount: number;
  items: DriftItem[];
  regressionTests: RegressionTestCase[];
  executedAt: string;
  summary: string;
}

export interface CitationReference {
  id: string;
  title: string;
  url: string;
  domain: string;
  isOfficialVendor: boolean;
  retrievedAt: string;
  excerpt: string;
  relevanceScore: number;
}

export interface TinyFishResearchRun {
  id: string;
  projectId: string;
  query: string;
  detectedStack: {
    sourceFramework: string;
    targetFramework: string;
    runtime: string;
  };
  status: 'completed' | 'failed' | 'simulated';
  findings: Array<{
    category: 'breaking_changes' | 'compatibility' | 'architecture' | 'prerequisites';
    headline: string;
    explanation: string;
    citationId: string;
  }>;
  citations: CitationReference[];
  completedAt: string;
}

export interface ModernizationReport {
  id: string;
  projectId: string;
  projectName: string;
  generatedAt: string;
  integrityHash: string;
  executiveSummary: string;
  inventoryMetrics: {
    files: number;
    loc: number;
    dependencies: number;
    databaseEntities: number;
  };
  findingsSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  migrationPath: {
    targetArchitecture: string;
    phasesCount: number;
    servicesCount: number;
  };
  driftVerification: {
    rulesCount: number;
    driftsDetected: number;
    regressionTestsPassed: number;
    regressionTestsFailed: number;
  };
  tinyFishEvidenceCount: number;
  signedOff: boolean;
  signedOffBy?: string;
}

// ==========================================
// MIGRATION SAFETY TWIN TYPES
// ==========================================
export interface TwinScenario {
  id: string;
  name: string;
  domain: string;
  inputPayload: Record<string, any>;
  originalOutput: Record<string, any>;
  proposedOutput: Record<string, any>;
  status: 'EQUIVALENT' | 'MISMATCH' | 'UNTESTED';
  executionTimeMs: number;
  divergenceExplanation?: string;
  originalSourceRef: string;
  proposedSourceRef: string;
}

export interface SafetyTwinComparison {
  id: string;
  projectId: string;
  originalRevision: string;
  proposedRevision: string;
  status: 'completed' | 'running' | 'mismatch_flagged';
  scenariosCount: number;
  mismatchesCount: number;
  scenarios: TwinScenario[];
  generatedAt: string;
  reviewStatus: 'needs_human_review' | 'approved' | 'rejected';
  executiveSummary: string;
}

// ==========================================
// MIGRATION CONFIDENCE GATE TYPES
// ==========================================
export type GateDimensionType =
  | 'source_coverage'
  | 'rule_traceability'
  | 'dependency_resolution'
  | 'api_contracts'
  | 'test_coverage'
  | 'regression_results'
  | 'security_findings'
  | 'data_migration'
  | 'rollback_readiness'
  | 'unresolved_assumptions';

export interface ConfidenceDimension {
  id: GateDimensionType;
  title: string;
  status: 'pass' | 'fail' | 'blocked' | 'not_assessed';
  evidence: string;
  issuesCount: number;
  references: string[];
  recommendedAction: string;
  weight: number;
}

export interface ConfidenceGateReport {
  id: string;
  projectId: string;
  overallStatus: 'ready_for_review' | 'blocked_by_issues' | 'insufficient_evidence' | 'validation_incomplete';
  humanApprovalStatus: 'pending' | 'approved' | 'rejected';
  approvalSignOff?: {
    approvedBy: string;
    approvedAt: string;
    justification: string;
  };
  dimensions: ConfidenceDimension[];
  summary: string;
  evaluatedAt: string;
}

// ==========================================
// CONTINUOUS MIGRATION GUARD TYPES
// ==========================================
export interface ContinuousGuardCheck {
  id: string;
  projectId: string;
  trigger: 'local_commit' | 'git_push' | 'pull_request' | 'manual';
  previousRevision: string;
  newRevision: string;
  changedFiles: string[];
  affectedModules: string[];
  affectedRules: string[];
  regressionTestsRun: number;
  newFailuresCount: number;
  guardStatus: 'clean' | 'regressions_detected' | 'review_required';
  checkedAt: string;
  commitMessage?: string;
  author?: string;
}

// ==========================================
// SMART SERVICE BOUNDARY ADVISOR TYPES
// ==========================================
export interface ServiceBoundaryRecommendation {
  id: string;
  moduleName: string;
  recommendedArchitecture: 'modular_monolith_interim' | 'microservice_candidate';
  couplingScore: number;
  cohesionScore: number;
  sharedDatabaseTables: string[];
  transactionComplexity: 'in_process' | 'distributed_saga_required';
  networkLatencyRisk: 'low' | 'moderate' | 'high';
  rationale: string;
  prerequisites: string[];
}

