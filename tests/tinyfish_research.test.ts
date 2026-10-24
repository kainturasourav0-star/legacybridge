import { describe, it, expect } from 'vitest';
import { TinyFishResearchAgent, OFFICIAL_DOCUMENTATION_DOMAINS } from '../src/lib/tinyfish/research';

describe('TinyFishResearchAgent (Migration Research Integration)', () => {
  const agent = new TinyFishResearchAgent();

  it('retrieves structured migration research with official vendor citations', async () => {
    const result = await agent.researchMigration({
      projectId: 'proj-acme-monolith-01',
      sourceFramework: 'Express 4.16',
      targetFramework: 'FastAPI',
      runtime: 'Node 20 / Python 3.11',
    });

    expect(result).toBeDefined();
    expect(result.citations.length).toBeGreaterThanOrEqual(1);

    // Verify citations have valid schema properties
    for (const citation of result.citations) {
      expect(citation.url).toMatch(/^https?:\/\//);
      expect(citation.domain).toBeDefined();
      expect(citation.excerpt.length).toBeGreaterThan(10);
      expect(citation.relevanceScore).toBeGreaterThan(0);
    }

    // Verify structured findings contain categorized intelligence
    expect(result.findings.length).toBeGreaterThanOrEqual(1);
    const hasCategory = result.findings.some((f) =>
      ['breaking_changes', 'compatibility', 'architecture', 'prerequisites'].includes(f.category)
    );
    expect(hasCategory).toBe(true);
  });

  it('maintains a strict official vendor documentation domain allowlist', () => {
    expect(OFFICIAL_DOCUMENTATION_DOMAINS).toContain('nodejs.org');
    expect(OFFICIAL_DOCUMENTATION_DOMAINS).toContain('fastapi.tiangolo.com');
    expect(OFFICIAL_DOCUMENTATION_DOMAINS).toContain('martinfowler.com');
  });
});
