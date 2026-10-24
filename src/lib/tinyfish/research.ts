import { z } from 'zod';
import { TinyFishResearchRun, CitationReference } from '../../types';
import { SAMPLE_TINYFISH_RESEARCH } from '../../fixtures/legacy_monolith/index';

// Official documentation domain allowlist
export const OFFICIAL_DOCUMENTATION_DOMAINS = [
  'nodejs.org',
  'fastapi.tiangolo.com',
  'python.org',
  'docs.python.org',
  'expressjs.com',
  'martinfowler.com',
  'spring.io',
  'docs.microsoft.com',
  'learn.microsoft.com',
  'developer.mozilla.org',
  'postgresql.org',
  'github.com',
];

// Zod schemas for TinyFish structured outputs
export const CitationSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  domain: z.string(),
  isOfficialVendor: z.boolean(),
  retrievedAt: z.string(),
  excerpt: z.string(),
  relevanceScore: z.number().min(0).max(1),
});

export const ResearchFindingSchema = z.object({
  category: z.enum(['breaking_changes', 'compatibility', 'architecture', 'prerequisites']),
  headline: z.string(),
  explanation: z.string(),
  citationId: z.string(),
});

export const TinyFishResearchResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  query: z.string(),
  detectedStack: z.object({
    sourceFramework: z.string(),
    targetFramework: z.string(),
    runtime: z.string(),
  }),
  status: z.enum(['completed', 'failed', 'simulated']),
  findings: z.array(ResearchFindingSchema),
  citations: z.array(CitationSchema),
  completedAt: z.string(),
});

export class TinyFishResearchAgent {
  private apiKey: string | undefined;
  private searchUrl: string;
  private fetchUrl: string;
  private agentUrl: string;

  constructor() {
    this.apiKey = process.env.TINYFISH_API_KEY;
    this.searchUrl = process.env.TINYFISH_SEARCH_URL || 'https://api.search.tinyfish.ai';
    this.fetchUrl = process.env.TINYFISH_FETCH_URL || 'https://api.fetch.tinyfish.ai';
    this.agentUrl = process.env.TINYFISH_AGENT_URL || 'https://agent.tinyfish.ai/v1/automation/run-sse';
  }

  isConfigured(): boolean {
    return !!this.apiKey && !this.apiKey.startsWith('tf_live_sample');
  }

  /**
   * Researches migration paths, breaking changes, and compatibility for detected stacks.
   */
  async researchMigration(params: {
    projectId: string;
    sourceFramework: string;
    targetFramework: string;
    runtime: string;
    query?: string;
  }): Promise<TinyFishResearchRun> {
    const { projectId, sourceFramework, targetFramework, runtime } = params;
    const query = params.query || `Migrating ${sourceFramework} to ${targetFramework} breaking changes and architectural prerequisites`;

    // 1. Transparent Demo Mode Fallback
    if (!this.isConfigured() || process.env.DEMO_MODE === 'true') {
      return {
        ...SAMPLE_TINYFISH_RESEARCH,
        id: `tf-res-${Date.now()}`,
        projectId,
        query,
        detectedStack: { sourceFramework, targetFramework, runtime },
        status: 'simulated',
        completedAt: new Date().toISOString(),
      };
    }

    // 2. Real TinyFish Search & Fetch API Execution
    try {
      // Step A: Search official docs via TinyFish Search (Official GET format)
      const searchQuery = `${sourceFramework} to ${targetFramework} migration guide`;
      const searchUrl = `${this.searchUrl}?query=${encodeURIComponent(searchQuery)}`;
      
      const searchRes = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey!,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (!searchRes.ok) {
        console.warn(`[TinyFish] Search API returned ${searchRes.status}, using cached official research fixture`);
        return this.fallbackWithProjectInfo(projectId, query, sourceFramework, targetFramework, runtime);
      }

      const searchData = await searchRes.json();
      const rawResults = Array.isArray(searchData.results) ? searchData.results : [];

      const citations: CitationReference[] = rawResults.map((item: any, idx: number) => {
        let hostname = 'unknown';
        try {
          hostname = new URL(item.url).hostname;
        } catch {
          hostname = 'docs';
        }
        const isOfficial = OFFICIAL_DOCUMENTATION_DOMAINS.some((d) => hostname.includes(d));

        return {
          id: `cite-${idx + 1}`,
          title: item.title || `${targetFramework} Official Migration Documentation`,
          url: item.url || 'https://nodejs.org',
          domain: hostname,
          isOfficialVendor: isOfficial,
          retrievedAt: new Date().toISOString(),
          excerpt: item.snippet || item.excerpt || 'Official technical documentation retrieved via TinyFish.',
          relevanceScore: item.score || 0.95,
        };
      });

      // If search yielded citations, formulate structured findings
      const findings = citations.slice(0, 3).map((cit, idx) => ({
        category: (idx === 0 ? 'breaking_changes' : idx === 1 ? 'compatibility' : 'architecture') as any,
        headline: `${cit.title} Guidance`,
        explanation: cit.excerpt,
        citationId: cit.id,
      }));

      const responsePayload: TinyFishResearchRun = {
        id: `tf-run-${Date.now()}`,
        projectId,
        query,
        detectedStack: { sourceFramework, targetFramework, runtime },
        status: 'completed',
        findings,
        citations,
        completedAt: new Date().toISOString(),
      };

      // Validate response against Zod schema
      return TinyFishResearchResponseSchema.parse(responsePayload);
    } catch (err: any) {
      console.error('[TinyFish] Execution failed, falling back safely:', err.message);
      return this.fallbackWithProjectInfo(projectId, query, sourceFramework, targetFramework, runtime);
    }
  }

  private fallbackWithProjectInfo(
    projectId: string,
    query: string,
    sourceFramework: string,
    targetFramework: string,
    runtime: string
  ): TinyFishResearchRun {
    return {
      ...SAMPLE_TINYFISH_RESEARCH,
      id: `tf-res-${Date.now()}`,
      projectId,
      query,
      detectedStack: { sourceFramework, targetFramework, runtime },
      status: 'simulated',
      completedAt: new Date().toISOString(),
    };
  }
}

export const tinyfishResearchAgent = new TinyFishResearchAgent();
