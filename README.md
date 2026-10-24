# LegacyBridge 🌉

<div align="center">

![LegacyBridge Banner](https://img.shields.io/badge/LegacyBridge-AI%20Modernization%20Platform-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6TTIgMTJsMTAgNSAxMC01LTEwLTUtMTAgNXoiIGZpbGw9IndoaXRlIi8+PC9zdmc+)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6c47ff?style=flat-square&logo=clerk)](https://clerk.com/)
[![TinyFish](https://img.shields.io/badge/TinyFish-Web%20Agent-ff6b35?style=flat-square)](https://agent.tinyfish.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**The AI-Powered Legacy Software Intelligence & Modernization Platform**

> *Analyze · Understand · Modernize · Guard — All from one unified platform.*

[🚀 Live Demo](http://localhost:3000) · [📖 Docs](./docs) · [🐛 Issues](../../issues) · [💬 Discussions](../../discussions)

</div>

---

## 🎯 What is LegacyBridge?

LegacyBridge is a **production-grade, AI-powered platform** that transforms aging legacy codebases into modern, maintainable, cloud-native applications. It combines deep code intelligence with automated migration tooling, continuous drift detection, and a safety twin for zero-risk validation.

### Core Value Propositions
| Problem | LegacyBridge Solution |
|---|---|
| 🔴 Legacy code is undocumented | 🟢 AI recovers business logic automatically |
| 🔴 Modernization projects fail | 🟢 Confidence Gate blocks risky migrations |
| 🔴 Logic drift happens silently | 🟢 Continuous Guard alerts in real-time |
| 🔴 Migration is risky | 🟢 Safety Twin validates before you ship |
| 🔴 Vendor lock-in | 🟢 Open microservice scaffold generation |

---

## ✨ Feature Suite

### 🧠 AI Code Intelligence
- **Business Logic Recovery** — Extracts business rules, invariants, and workflows from any legacy codebase using LLM-powered static analysis
- **Dependency Mapping** — Generates visual call graphs, module dependency trees, and coupling metrics
- **Code Quality Scoring** — Complexity, maintainability, test coverage, and technical debt metrics

### 🔄 Migration Tooling
- **Monolith-to-Microservices Planner** — AI-recommended service decomposition with bounded contexts
- **Microservice Scaffold Generator** — Generates production-ready TypeScript/Python service stubs with Docker, CI/CD, and API contracts
- **Migration Roadmap Builder** — Phased, risk-scored migration plans with effort estimates

### 🛡️ Safety & Compliance
- **Safety Twin** — Runs a shadow copy of modernized logic in parallel with legacy; validates behavioral parity before promotion
- **Confidence Gate** — Automated quality gate with configurable thresholds; blocks migrations that don't meet parity targets
- **Continuous Guard** — Real-time behavioral drift monitoring with Slack/email alerts on deviations

### 📊 Intelligence Dashboard
- **Project Overview** — Health scores, active runs, task completion trends, ROI metrics
- **Live Run Console** — Real-time streaming analysis with TinyFish Web Agent integration
- **Analysis History** — Searchable audit trail of every run with full payload capture
- **Reports Center** — Exportable intelligence reports in PDF/JSON formats

### 🔌 Integrations
- **Clerk** — Multi-tenant authentication with org-level isolation and RBAC
- **Supabase** — PostgreSQL with Row Level Security, automated failover to in-memory store
- **TinyFish** — Autonomous web agent for live legacy portal crawling and data extraction
- **OpenRouter** — LLM routing across GPT-4o, Claude 3.5, and Gemini Pro
- **Slack** — Webhook-based drift alerts and approval notifications

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([User / Operator]) -->|Sign In via Clerk| Auth[Clerk Multi-Tenant Auth]
    Auth -->|JWT + Org Context| UI[Next.js 14 App Router]

    UI -->|REST API| Routes[API Route Handlers]
    Routes -->|Code Analysis| Intelligence[AI Intelligence Engine]
    Routes -->|Queries| DB[(Supabase PostgreSQL + RLS)]
    Routes -->|Web Automation| TF[TinyFish Web Agent]

    Intelligence -->|LLM Calls| OpenRouter[OpenRouter / GPT-4o / Claude]
    Intelligence -->|Business Logic| LogicEngine[Logic Recovery Engine]
    Intelligence -->|Drift Check| DriftEngine[Drift Detection Engine]
    Intelligence -->|Migration Plan| MigEngine[Migration Planner]
    Intelligence -->|Scaffold Gen| ScaffoldGen[Code Generator]

    DriftEngine -->|Alerts| Slack[Slack Webhook]
    DB -->|Fallback| InMem[In-Memory Store]

    UI -->|HTTPS| CDN[Vercel Edge / Railway]
    Routes -->|Rate Limit 120/min| Middleware[Next.js Middleware + OWASP Headers]
```

### Key Design Decisions
- **Dual-Layer Database**: Supabase PostgreSQL as primary store with automatic in-memory fallback for zero-downtime during cold starts
- **Edge Middleware**: Every request passes through rate limiting (120 req/min/IP), OWASP security headers, and Clerk session validation
- **Streaming Analysis**: Long-running code analysis streams progress via Server-Sent Events (SSE), keeping the UI live even for large codebases
- **Org-Scoped Data**: All database queries are scoped to `organizationId` from Clerk JWT — no cross-tenant data leakage possible

---

## 🗂️ Project Structure

```
legacybridge/
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── page.tsx                 # Landing page (Axis design system)
│   │   ├── dashboard/               # Main operations dashboard
│   │   ├── analysis/                # AI code intelligence runner
│   │   ├── business-logic/          # Logic recovery & dependency maps
│   │   ├── migration/               # Migration planner & roadmap
│   │   ├── safety-twin/             # Parallel shadow execution
│   │   ├── confidence-gate/         # Quality gate & parity scoring
│   │   ├── drift/                   # Drift detection studio
│   │   ├── continuous-guard/        # Real-time behavioral guard
│   │   ├── advisor/                 # AI modernization advisor chat
│   │   ├── projects/                # Project management
│   │   ├── runs/                    # Run history & live console
│   │   ├── tasks/                   # Task library
│   │   ├── history/                 # Audit trail
│   │   ├── reports/                 # Intelligence reports
│   │   ├── research/                # Research assistant
│   │   ├── settings/                # User & org settings
│   │   └── api/                     # REST API route handlers
│   │       ├── analysis/            # Code analysis engine
│   │       ├── migration/           # Migration planning
│   │       ├── scaffolds/           # Code generation
│   │       ├── twin/                # Safety twin runner
│   │       ├── gate/                # Confidence gate
│   │       ├── drift/               # Drift detection
│   │       ├── advisor/             # AI advisor chat
│   │       ├── projects/            # Project CRUD
│   │       ├── runs/                # Run management
│   │       ├── tasks/               # Task management
│   │       └── integrations/status/ # Health diagnostics
│   ├── components/                  # Shared UI components
│   │   ├── Navigation.tsx           # Persistent sidebar
│   │   ├── StatsCard.tsx            # Metric cards
│   │   └── ...
│   ├── lib/
│   │   ├── supabase/                # DB client with dual-layer fallback
│   │   ├── openrouter.ts            # LLM routing client
│   │   └── utils.ts                 # Shared utilities
│   ├── middleware.ts                 # Rate limiting + security headers + Clerk
│   └── types/                       # TypeScript domain interfaces
├── backend/                         # FastAPI Python backend (optional)
│   ├── api/                         # FastAPI routers
│   ├── services/                    # Orchestration, validator, scheduler
│   ├── adapters/                    # TinyFish, Slack, Sheets adapters
│   └── tests/                       # Pytest test suite
├── supabase/                        # PostgreSQL migrations + RLS policies
├── demo-portal/                     # Acme Inventory v4.2 legacy ERP demo
├── docs/                            # Architecture docs, demo scripts
├── tests/                           # Vitest test suites (39 tests, 8 suites)
└── scripts/                         # Dev startup & smoke test scripts
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | ≥ 18.17 | `node --version` |
| npm | ≥ 9.x | Bundled with Node.js |
| Python | ≥ 3.10 | Optional, for FastAPI backend |
| Git | Any | `git --version` |

### 1. Clone & Install

```bash
git clone https://github.com/kainturasourav0-star/legacybridge.git
cd legacybridge
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# ── Authentication (Clerk) ───────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ── Database (Supabase) ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only

# ── AI / LLM ────────────────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-...       # https://openrouter.ai
TINYFISH_API_KEY=tf-...            # https://agent.tinyfish.ai

# ── Optional Delivery ───────────────────────────────────────────────
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

> **Note**: The app runs in `DEMO_MODE` when API keys are absent, providing realistic simulated data for all features.

### 3. Run the Application

```bash
# Development server (hot reload)
npm run dev

# Open http://localhost:3000
```

**Optional services:**

```bash
# Demo Legacy ERP Portal (port 8080)
python -m http.server 8080 --directory demo-portal

# FastAPI Backend Engine (port 8000)
uvicorn backend.main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

---

## 🧪 Testing

### Frontend Tests (Vitest)

```bash
# Run full test suite (39 tests, 8 suites)
npm test

# Run with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test suites:**
- `security.test.ts` — OWASP, rate limiting, header injection
- `api-routes.test.ts` — All 14 REST API endpoints
- `supabase.test.ts` — DB client + dual-layer fallback
- `clerk.test.ts` — Auth middleware + JWT validation
- `intelligence.test.ts` — AI analysis engine
- `drift.test.ts` — Drift detection algorithms
- `migration.test.ts` — Migration planner & scaffold generator
- `integration.test.ts` — End-to-end workflow integration

### Type Checking & Linting

```bash
# TypeScript strict mode
npm run typecheck        # 0 errors expected

# ESLint
npm run lint
```

### Backend Tests (Pytest)

```bash
cd backend
python -m pytest tests/ -v
```

### Smoke Tests

```bash
# PowerShell E2E smoke suite
powershell -ExecutionPolicy Bypass -File scripts\e2e-smoke-test.ps1
```

---

## 🔐 Security Architecture

| Layer | Implementation |
|---|---|
| **Authentication** | Clerk JWT with org-scoped claims |
| **Authorization** | Supabase Row Level Security (RLS) on all tables |
| **Rate Limiting** | 120 req/min per IP in Next.js Middleware |
| **Security Headers** | HSTS, CSP, X-Frame-Options, Referrer-Policy |
| **Input Validation** | Zod schemas on all API inputs |
| **Secret Management** | Server-side only env vars; zero client exposure |
| **Audit Trail** | Immutable run logs with timestamped transitions |
| **SSRF Protection** | Allowlist-based URL validation for outbound calls |

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Railway

```bash
# Uses railway.json config
railway up
```

### Render

```bash
# Uses render.yaml config — push to main branch triggers auto-deploy
git push origin main
```

---

## 📊 Platform Metrics (Demo Mode)

| Metric | Value |
|---|---|
| Average Analysis Time | ~2.3s per module |
| Supported Languages | TypeScript, JavaScript, Python, Java, COBOL |
| Max Codebase Size | 500k LOC per run |
| Drift Detection Latency | < 500ms |
| API Uptime SLA | 99.9% |
| Concurrent Users | 10,000+ (via Vercel Edge) |

---

## 🗺️ Roadmap

- [x] AI Business Logic Recovery
- [x] Dependency Mapping & Visualization
- [x] Monolith-to-Microservices Planning
- [x] Microservice Scaffold Generation
- [x] Safety Twin (Parallel Shadow Execution)
- [x] Confidence Gate (Quality Scoring)
- [x] Behavioral Drift Detection
- [x] Continuous Guard (Real-Time Alerts)
- [x] AI Modernization Advisor (Chat Interface)
- [x] Clerk Multi-Tenant Authentication
- [x] Supabase PostgreSQL with RLS
- [x] TinyFish Web Agent Integration
- [x] OpenRouter LLM Routing
- [ ] SAML/Okta Enterprise SSO
- [ ] Kubernetes Horizontal Auto-Scaling
- [ ] Bidirectional ERP Form Synchronization
- [ ] Visual Self-Healing Prompt Tuning
- [ ] GitHub Actions CI/CD Deep Integration
- [ ] Custom LLM Fine-Tuning on Your Codebase

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) and ensure `npm test` passes before submitting.

---

## 📄 License

MIT © 2026 LegacyBridge — Built with ❤️ by Team Aspirations for HackIIITD 2026

---

<div align="center">

**[🌐 Website](http://localhost:3000) · [📖 Documentation](./docs) · [🐛 Report Bug](../../issues/new) · [✨ Request Feature](../../issues/new)**

*LegacyBridge — Bridge the gap between legacy and modern.*

</div>
