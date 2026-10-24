# LegacyBridge 🌉
> **"Describe the task. Keep the old system."**  
> *Built for HackIIITD 2026 by Team Aspirations*

LegacyBridge bridges the gap between ancient legacy portals (ERP, CRM, mainframe wrappers) and modern AI automation. Turn any clunky 2000s web portal into a validated, scheduled REST API and Slack/Sheets feed using natural language, powered by TinyFish Web Agent and LangChain.

---

## 🌟 The Three Trust Pillars
1. **VALIDATE**: Agent completion (`COMPLETED`) does not mean the business goal is met. Output must pass strict Pydantic v2 schemas, row count invariants, null percentage thresholds, and historical drift/anomaly detection.
2. **APPROVE**: Safe-by-default. Read-only extractions run uninterrupted; high-impact mutations (e.g. updating stock reorder levels) trigger a clear before/after diff for human one-click sign-off.
3. **AUDIT**: Cryptographic and immutable history. Every task run records each transition step with timestamps, raw JSON payloads, live TinyFish replay links, and delivery receipts.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([User / Operator / Cron]) -->|Natural Language Prompt| UI[Next.js 14 App Router UI]
    UI -->|REST / SSE Stream| FastAPI[FastAPI Backend Engine]
    FastAPI -->|Goal & Schema Synthesis| Planner[LangChain Planner Adapter]
    FastAPI -->|Vault Credentials| Vault[(Encrypted Vault Store)]
    FastAPI -->|Automation & SSE| TinyFish[TinyFish Web Agent]
    TinyFish -->|Session & DOM Traversal| LegacyPortal[Acme Inventory v4.2 Demo ERP]
    TinyFish -.->|Live Replay Stream| UI
    FastAPI -->|Extracted JSON| Validator[Pydantic v2 & Anomaly Engine]
    Validator -->|Schema Validated| StateMachine[Run State Machine]
    StateMachine -->|Write Action| ApprovalQueue[Human Approval Gate]
    StateMachine -->|Dispatched Payload| Sinks[Slack Webhook / Google Sheets / SQL]
    StateMachine -->|Instant REST Endpoint| FeedAPI[GET /api/v1/feeds/:id/latest]
    StateMachine -->|Persist Logs & Steps| Database[(PostgreSQL / SQLite)]
```

---

## 🚀 Quickstart (Clean Clone to Live in 2 Minutes)

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- Git

### One-Command Setup & Launch
```bash
# 1. Clone repository
git clone https://github.com/kainturasourav0-star/legacybridge.git
cd legacybridge

# 2. Setup Environment
cp .env.example .env

# 3. Start All Services (Backend, Frontend, Demo ERP)
# Windows PowerShell:
.\scripts\start-all.ps1

# Or run manually in separate terminals:
# Terminal 1: Demo Legacy ERP (Port 8080)
cd demo-portal && python -m http.server 8080

# Terminal 2: FastAPI Backend (Port 8000)
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Terminal 3: Next.js Frontend (Port 3000)
cd frontend && npm install && npm run dev
```

Visit:
- **LegacyBridge Web Console:** [http://localhost:3000](http://localhost:3000)
- **Acme Inventory Demo ERP:** [http://localhost:8080](http://localhost:8080)
- **FastAPI Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎯 Demo Mode vs Live Mode
- **DEMO_MODE=true (Default)**: Fully deterministic! TinyFish streaming events, realistic latency pauses, live replay video link, and mock Slack/Sheets deliveries are simulated faithfully so live stage presentations never fail due to Wi-Fi hiccups.
- **DEMO_MODE=false**: Uses real credentials:
  - `TINYFISH_API_KEY`: Key from `agent.tinyfish.ai`
  - `OPENAI_API_KEY`: For live LangChain schema generation
  - `SLACK_WEBHOOK_URL`: Real channel notifications

---

## 📦 Monorepo Structure
```
legacybridge/
├── backend/            # FastAPI, LangChain, Pydantic v2, APScheduler, SQLAlchemy
│   ├── api/            # REST endpoints, SSE streams, feed routes
│   ├── services/       # State machine, runner, validation engine
│   ├── adapters/       # TinyFish client, Slack, Sheets, LLM Planner
│   ├── models/         # SQLAlchemy models (tasks, runs, steps, approvals)
│   └── tests/          # Pytest suite for validator & state machine
├── frontend/           # Next.js App Router, TailwindCSS, Lucide, Framer Motion
│   ├── app/            # Task builder, live run, history, approvals, feed
│   ├── components/     # UI design system, timeline, diff viewer
│   └── lib/            # SSE client, API wrappers, store
├── demo-portal/        # Acme Inventory v4.2 (2000s ERP with frames & Break UI toggle)
├── docs/               # Architecture PLAN.md, DEMO_SCRIPT.md
└── scripts/            # Startup scripts & database seeding
```

---

## 🏆 Key Features for HackIIITD 2026
1. **ROI & Time-Saved Meter**: Real-time business savings tracking ($ value & hours).
2. **Break-the-UI Adaptation**: Test the agent by rearranging the legacy ERP's DOM live; the agent adapts without CSS selector brittleness.
3. **Pydantic Self-Healing Loop**: If data fails validation, the error feedback automatically guides a targeted self-heal attempt.
4. **Instant API-ification**: Any legacy web screen automatically exports a clean REST API: `GET /api/v1/feeds/{task_id}/latest`.
5. **Approval Diff Gate**: Human-in-the-loop review for any write operation with before-and-after change preview.
