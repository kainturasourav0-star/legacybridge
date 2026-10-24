# LegacyBridge — System Architecture & Technical Specifications

## 1. System Overview
LegacyBridge is designed around a decoupled, modular architecture adhering to zero-trust principles. The frontend is built on Next.js 14 App Router, providing a responsive Axis-themed user interface, and the backend leverages server-side services, deterministic analysis pipelines, and sandboxed execution environments.

```mermaid
graph TB
    subgraph Client [Browser Client - Axis Monochrome UI]
        Landing[Landing Page /]
        Dashboard[Overview Dashboard /dashboard]
        ArchMap[Architecture Graph /architecture]
        DriftView[Drift Detector /drift]
        ScaffoldView[Scaffold Studio /migration]
        ResearchView[TinyFish Research /research]
    end

    subgraph AppRouter [Next.js App Router API & Server Actions]
        AuthGuard[Clerk Auth & Session Guard]
        ProjectAPI[/api/projects]
        AnalysisAPI[/api/analysis]
        DriftAPI[/api/drift]
        ResearchAPI[/api/research]
        ScaffoldAPI[/api/scaffolds]
    end

    subgraph CoreServices [Core Business Logic & Isolation]
        CodeParser[Static AST & Regex Code Parser]
        DriftEngine[Business Logic Drift Comparator]
        Scaffolder[Microservice Scaffold Generator]
        TinyFishAgent[TinyFish Migration Research Client]
        TestSandbox[Isolated Validation Test Runner]
    end

    subgraph DataLayer [Storage & Persistence]
        SupabaseDB[(Supabase PostgreSQL / SQLite)]
        SupabaseStorage[(Supabase Secure Storage)]
        LocalCache[(Memory & File Cache)]
    end

    subgraph ExternalServices [External Integrations]
        TinyFishSearch[TinyFish Search API]
        TinyFishFetch[TinyFish Fetch API]
        TinyFishAgentAPI[TinyFish Web Agent SSE]
        OpenRouterLLM[OpenRouter / LLM Provider]
        GitHubAPI[GitHub Repository API]
    end

    Client -->|HTTPS / SSE| AppRouter
    AppRouter --> AuthGuard
    AuthGuard --> CoreServices
    CoreServices --> DataLayer
    TinyFishAgent --> TinyFishSearch
    TinyFishAgent --> TinyFishFetch
    TinyFishAgent --> TinyFishAgentAPI
    CoreServices --> OpenRouterLLM
    AppRouter --> GitHubAPI
```

## 2. Component Design & Responsibilities

### 2.1 Code Intelligence Engine (`src/lib/analysis/`)
- **Deterministic File Scanner**: Traverses code trees, ignoring package manifests, build outputs, and binaries.
- **AST & Lexical Parsers**: Detects language-specific structures (JavaScript/TypeScript ES6+, Python 3/2, Java, SQL).
- **Rule Miner**: Scans for conditional blocks (`if`, `switch`, validation constraints, formula calculations) and normalizes them into structured business rule definitions.

### 2.2 Interactive Graph Architecture (`src/features/architecture/`)
- Canvas rendering with pan/zoom/filter controls.
- Nodes represent modules, database tables, and external interfaces.
- Edges quantify coupling intensity (call frequency, import counts, shared state).
- Boundary overlays represent candidate microservice domains (e.g. Orders, Customers, Inventory).

### 2.3 Drift Detection & Regression Engine (`src/lib/drift/`)
- **Rule Comparator**: Compares AST rule trees between legacy monolith and target microservice.
- **Diff Classifier**: Classifies changes as `IDENTICAL`, `THRESHOLD_MODIFIED`, `LOGIC_INVERTED`, `UNMAPPED`, or `EXTRA_CHECK`.
- **Regression Runner**: Executes sandboxed unit tests against both implementations with identical parameters and verifies return structures.

### 2.4 TinyFish Migration Research Integration (`src/lib/tinyfish/`)
- **TinyFish Search** (`https://api.search.tinyfish.ai`): Discovers official documentation pages for detected legacy-to-modern version pairs (e.g., Express to FastAPI, Java 8 to Spring Boot 3).
- **TinyFish Fetch** (`https://api.fetch.tinyfish.ai`): Pulls markdown clean content from allowlisted official documentation domains.
- **TinyFish Agent SSE** (`https://agent.tinyfish.ai/v1/automation/run-sse`): Streams multi-step research findings for complex architectural migrations.

## 3. Data Schema & Persistence Strategy
All entities follow strict relational integrity with user/organization ownership:
- `projects`: Root project metadata, source type, and active revision.
- `analysis_runs`: Static analysis results, metrics, and AST snapshots.
- `business_rules`: Extracted business rules with line markers and parameters.
- `service_candidates`: Proposed microservice boundaries and cohesion metrics.
- `migration_plans`: Multi-phase Strangler Fig schedules and risk items.
- `drift_analyses`: Detected differences, regression test runs, and test outputs.
- `research_findings`: TinyFish citations, URLs, domain badges, and excerpts.
- `modernization_reports`: Exported signed reports with SHA-256 hashes.
