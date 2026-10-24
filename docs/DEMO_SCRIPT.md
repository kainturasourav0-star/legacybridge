# LegacyBridge — Official Platform Demonstration Script

This interactive walkthrough demonstrates the complete **LegacyBridge** AI-powered legacy software intelligence, business logic recovery, and microservices modernization platform.

---

## Prerequisites & Launch
Start the Next.js development server:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## Complete End-to-End Walkthrough

### 1. Landing Page & Visual Benchmark (`/`)
- **Visual Composition**: Observe the Axis monochrome design benchmark (`#050505` obsidian background, `#18181B` surface cards, `#A78BFA` purple accents, and restrained micro-animations).
- **Core Value Proposition**: Hero headline: *"Understand Legacy. Build What's Next."*
- **Primary CTAs**: Click **"Start Free Analysis"** or **"Explore Platform"** to enter the modernized workspace.
- **Navigable Pillars**: Links to Migration Safety Twin, Drift Detector, and Service Boundary Advisor directly from the landing page.

### 2. Operations & Intelligence Command Center (`/dashboard`)
- **Overview KPIs**: View active monolith projects, total AST-extracted rules, regression pass rates, and candidate microservice counts.
- **Modernization Quick Actions**: Direct access to the **Drift Detector (Flagship)**, **Migration Safety Twin**, **Service Boundary Advisor**, **Confidence Gate**, **Continuous Guard**, and **TinyFish Research Agent**.

### 3. Codebase Ingestion & File Inventory (`/projects` & `/analysis`)
- Navigate to **Projects** (`/projects`) to view the imported **Acme Enterprise Monolith (ERP Core)** (34 files, 8,420 lines of code).
- Navigate to **Code Analysis** (`/analysis`) to inspect the file inventory, entrypoints, and raw SQL queries mapping to PostgreSQL tables (`customers`, `orders`, `order_items`, `inventory`).

### 4. Interactive Architecture & Dependency Map (`/architecture`)
- Inspect the interactive AST call graph showing inter-module calls and database coupling.
- Click on **`OrderController & Pipeline`** to reveal its coupling score (0.88 - High Coupling Hotspot) and notice that order placement directly mutates the inventory table state.
- Notice the candidate microservice boundaries: **Orders Service**, **Inventory Service**, and **Customer & Risk Service**.

### 5. Smart Service Boundary Advisor (`/advisor`)
- Navigate to **Service Boundary Advisor** (`/advisor`).
- **Architectural Trade-Off Analysis**: Observe that the advisor evaluates module cohesion, dependency coupling, shared database usage, transaction boundaries, and independent scaling needs.
- **Interim Modular Monolith Recommendation**: Notice that rather than prematurely splitting `Orders` and `Inventory` into separate microservices (which creates distributed 2PC / Saga transaction hazards), the advisor explicitly recommends an interim **Modular Monolith** boundary with clean in-process contracts.

### 6. Business Logic Recovery (`/business-logic`)
- View the catalog of deterministic business rules extracted directly from legacy monolith source code.
- Select **`Tiered Volume Discount Calculation`** (Lines 25-39) to inspect normalized condition predicates and exact parameter mappings.
- Select **`Enterprise Commercial Credit Underwriting Gate`** (Lines 48-78) to view the 650 credit score requirement.

### 7. Microservices Migration Planner & Scaffold Studio (`/migration`)
- Review the 4-phase **Strangler Fig Rollout Schedule**:
  - Phase 1: Inventory & Catalog Service Extraction (Completed)
  - Phase 2: Customer & Credit Risk Service Extraction (In Progress)
  - Phase 3: Order Processing Core & Strangler Cutover (Planned)
  - Phase 4: Monolith Deprecation & Final Decommission (Planned)
- Click **"Authorize Migration Plan"** to record formal architectural sign-off.
- In the Scaffold Studio, select **Orders Service** to inspect the generated **Express / TypeScript** scaffold, **OpenAPI 3.1** specification, and production **Dockerfile**. Notice the explicit `// TODO: HUMAN ARCHITECT REVIEW REQUIRED` marker where business logic requires human validation.

### 8. Flagship: Business Logic Drift Detector (`/drift`)
- Navigate to **Drift Detector** (`/drift`).
- **Demonstration Context**: A developer modernized the legacy monolith into a target microservice, but accidentally altered business behavior:
  1. Commercial credit cutoff for Enterprise clients was raised from **650 to 675**.
  2. Volume discount for tier-2 (50-99 units) was reduced from **15% to 10%**.
  3. **Flagship Edge-Case Regression**: `qty: 5, stock: 2` — the legacy monolith safely rejects insufficient inventory, but the modernized service confirms the order!
- Click **"Execute Drift Regression"**:
  - Watch the reverse regression suite execute against both original monolith and modernized microservice in real time.
  - Review the exact side-by-side AST code diff, expected vs observed output payloads, and business impact analysis.

### 9. Migration Safety Twin (`/safety-twin`)
- Navigate to **Safety Twin** (`/safety-twin`).
- **Dual Execution Engine**: Run identical controlled input payloads side-by-side against both the legacy runtime and modernized candidate.
- Click **"Execute Dual Trace"** on the Insufficient Stock test case:
  - Original Monolith Output: `{ success: false, reason: "Insufficient stock" }` (HTTP 409)
  - Modernized Candidate Output: `{ success: true, orderId: "ORD-9921", status: "confirmed" }` (HTTP 200)
- Notice the **DIVERGENCE CONFIRMED** alert, preventing premature deployment.

### 10. Migration Confidence Gate (`/confidence-gate`)
- Navigate to **Confidence Gate** (`/confidence-gate`).
- Review the **10-Dimension Readiness Matrix**:
  1. Source Coverage (100% mapped)
  2. Business-Rule Traceability (100% verified)
  3. Dependency Resolution (Modular Monolith isolated)
  4. API Contract Validation (OpenAPI 3.1 valid)
  5. Test Coverage (39 automated tests passing)
  6. Regression Results (BLOCKED by stock edge case)
  7. Security & Sanitization (Secret scanning zero leaks)
  8. Data Migration Readiness (Schema migrations ready)
  9. Deployment & Rollback (Strangler Fig plan active)
  10. Unresolved Assumptions (Requires human operator review)
- Observe that the gate status is **BLOCKED BY VERIFIED ISSUES**.
- Test the **Human Operator Sign-Off Modal** with justification and sign-off recording.

### 11. Continuous Migration Guard (`/continuous-guard`)
- Navigate to **Continuous Guard** (`/continuous-guard`).
- Inspect blast-radius impact analysis for incoming git revisions and pull requests.
- See affected modules (`OrderController`, `InventoryService`), impacted business rules, and targeted regression test triggers.

### 12. TinyFish Migration Research Agent (`/research`)
- Navigate to **Migration Research** (`/research`).
- The TinyFish agent autonomously discovers official vendor documentation for migrating legacy runtimes (e.g. Node.js 14 EOL to Node.js 20 LTS, Express to FastAPI).
- Inspect the **Official Vendor Citations** showing allowlisted domains (`nodejs.org`, `fastapi.tiangolo.com`, `martinfowler.com`), timestamps, and direct external links.
- Supports live API search with fallback to deterministic local cache if external credentials are unset.

### 13. Security & Technical Debt Audit (`/security`)
- Filter findings by severity (`Critical`, `High`, `Medium`).
- Inspect the Knex SQL injection vulnerability (`find-004`) with line numbers and recommended parameterized queries.
- In-memory rate limiting and HMAC SHA-256 webhook verification active.

### 14. Modernization Dossier & Report Sign-Off (`/reports`)
- View the consolidated audit report with executive summary, inventory metrics, drift verdicts, and TinyFish evidence counts.
- Notice the **SHA-256 Cryptographic Integrity Hash** (`e3b0c44...`).
- Click **"Export JSON"** to download the structured machine-readable dossier.
- Click **"Architectural Sign-off"** to complete the end-to-end modernization cycle.

### 15. Operational & Legal Pages
- Direct access to company and policy infrastructure:
  - **About**: `/about` — The legacy rewrite dilemma & architecture philosophy
  - **Pricing**: `/pricing` — Starter ($499/mo), Professional ($1,499/mo), Enterprise
  - **FAQ**: `/faq` — 6 deep technical architecture questions answered
  - **Terms**: `/terms` & **Privacy**: `/privacy` — Legal, GDPR, CCPA policies
  - **Thank You**: `/thank-you` — Post-conversion onboarding & verification confirmation
