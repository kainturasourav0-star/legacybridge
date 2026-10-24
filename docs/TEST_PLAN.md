# LegacyBridge — Automated Test Plan & Quality Assurance (TEST_PLAN.md)

## 1. Test Strategy Overview
LegacyBridge utilizes a multi-layered verification strategy combining unit tests, deterministic AST integration tests, security fuzzing, drift detection verification, and end-to-end browser walkthroughs.

## 2. Test Suites & Coverage Targets

### 2.1 Unit & Integration Tests (Vitest)
- **Static Code Parser (`tests/code_intelligence.test.ts`)**:
  - File tree traversal & language classification.
  - AST business rule extraction accuracy on JavaScript and Python monolith samples.
  - Dependency edge identification and coupling index calculation.
- **Drift Detection Engine (`tests/drift_detector.test.ts`)**:
  - Exact rule matching when rules are identical.
  - Threshold alteration detection (e.g., credit score requirement shifted from 650 to 680).
  - Condition inversion detection (e.g., `<` changed to `<=`).
  - Missing business rule detection.
- **Regression Test Execution (`tests/regression_runner.test.ts`)**:
  - Verifies test case generation from business rule boundaries.
  - Execution of regression inputs against sample legacy monolith and modernized service.
  - Confirms test failure is reported with exact observed output and diff.
- **Security & Path Traversal (`tests/security.test.ts`)**:
  - Zip-Slip path traversal rejection.
  - Secret redaction filter on code samples.
  - Max file count & size enforcement.
- **TinyFish Research Service (`tests/tinyfish_research.test.ts`)**:
  - Handling of missing credentials with transparent demo mode indicator.
  - Proper citation extraction (URL, title, domain, excerpt).
  - Timeout and retry resilience.

### 2.2 End-to-End Verification
- **Hackathon Demo Script Execution**:
  - Import legacy monolith sample.
  - Run AST analysis -> view dependencies on interactive graph.
  - Review candidate microservice boundaries.
  - Generate microservice scaffold.
  - Trigger Drift Detection on altered modern rule.
  - Execute regression test -> observe failed test assertion and diff.
  - Query TinyFish research for migration documentation.
  - Export evidence-based modernization report.

## 3. Continuous Integration
All tests execute via GitHub Actions on every commit and pull request. Zero test failures and strict TypeScript compilation (`tsc --noEmit`) are mandatory for merge.
