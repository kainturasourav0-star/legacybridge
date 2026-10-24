# LegacyBridge — External Integrations & Service Architecture (INTEGRATIONS.md)

## 1. Integration Matrix

| Integration | Product Role | Endpoint / Protocol | Auth Mechanism | Fallback Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TinyFish Search** | Official documentation discovery | `https://api.search.tinyfish.ai` | `X-API-Key` | Cached official docs fixtures |
| **TinyFish Fetch** | Markdown documentation extraction | `https://api.fetch.tinyfish.ai` | `X-API-Key` | Curated documentation excerpts |
| **TinyFish Agent** | Multi-step research & web agent | `https://agent.tinyfish.ai/v1/automation/run-sse` | `X-API-Key` (SSE) | Deterministic migration trajectory |
| **OpenRouter / LLM** | Semantic explanation & summaries | `https://openrouter.ai/api/v1` | `Bearer $OPENROUTER_API_KEY` | Deterministic local rule engine |
| **Clerk** | Authentication & user sessions | Clerk SDK / JWT verification | Cookie / Bearer JWT | Local demo developer session |
| **Supabase** | Relational DB & storage buckets | Supabase REST / PostgREST | Service Key / Anon Key | Embedded SQLite fallback engine |
| **GitHub** | Authorized repository import | `https://api.github.com` | OAuth Bearer token | Local ZIP file upload |

---

## 2. TinyFish Integration Details
LegacyBridge integrates with TinyFish as the **Migration Research Agent**. TinyFish retrieves current, verified documentation from official vendor sources (e.g., nodejs.org, fastapi.tiangolo.com, spring.io) to support legacy migration decisions.

### 2.1 Request Headers
```http
POST https://api.search.tinyfish.ai
X-API-Key: tf_live_your_actual_key
Content-Type: application/json
```

### 2.2 Citation Contract
Every finding retrieved through TinyFish produces a validated citation record:
```json
{
  "id": "cite-tf-101",
  "title": "Express to FastAPI: Architectural Guidance",
  "sourceUrl": "https://fastapi.tiangolo.com/tutorial/",
  "sourceDomain": "fastapi.tiangolo.com",
  "isOfficialVendor": true,
  "retrievedAt": "2026-10-24T18:30:00Z",
  "excerpt": "FastAPI provides native asynchronous route handlers, Pydantic data validation, and automated OpenAPI generation."
}
```

### 2.3 Safeguards
- Client source code and database credentials are never transmitted to TinyFish endpoints.
- Unofficial or unverified blog posts are visually tagged as "Third-party community content" versus "Official Vendor Documentation".
