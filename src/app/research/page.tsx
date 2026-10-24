'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  ArrowUpRight,
  Globe,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { TinyFishResearchRun } from '@/types';
import { SAMPLE_TINYFISH_RESEARCH } from '@/fixtures/legacy_monolith';

export default function TinyFishResearchPage() {
  const [research, setResearch] = useState<TinyFishResearchRun>(SAMPLE_TINYFISH_RESEARCH);
  const [query, setQuery] = useState('Migrating Express.js monolith to FastAPI microservices breaking changes');
  const [loading, setLoading] = useState(false);

  const executeResearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        setResearch(data);
      }
    } catch (e) {
      console.error('Research error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/research')
      .then((r) => r.json())
      .then((data) => setResearch(data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Search className="w-3.5 h-3.5" />
            <span>TINYFISH LIVE RESEARCH AGENT · OFFICIAL DOCUMENTATION HARVESTER</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Migration Research Agent
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Autonomous live research engine powered by TinyFish Search & Fetch APIs. Discovers verified official vendor documentation, breaking changes, and architectural prerequisites for detected legacy runtimes.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-[11px] font-mono px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[#8a8f98] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#4daf73] shadow-[0_0_8px_rgba(77,175,115,0.6)]" />
            <span>TinyFish Agent API Connected</span>
          </span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
        <label className="text-xs font-mono text-[#8a8f98] uppercase">
          Research Topic / Migration Query
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5d626b] absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Node.js 14 to 20 migration breaking changes or Express to FastAPI..."
              className="w-full bg-[#050505] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#8b95ff] transition"
            />
          </div>
          <button
            onClick={executeResearch}
            disabled={loading}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition shadow-md shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#08090a]" />
                <span>Harvesting Official Docs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>Launch TinyFish Research</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#5d626b]">
          <span>Detected Source: <strong className="text-[#8a8f98] font-mono">{research.detectedStack.sourceFramework}</strong></span>
          <span>&rarr;</span>
          <span>Target Architecture: <strong className="text-[#8b95ff] font-mono">{research.detectedStack.targetFramework}</strong></span>
        </div>
      </div>

      {/* Citations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-medium text-[#8a8f98] uppercase tracking-wider">
            Official Vendor Citations & Verified Sources ({research.citations.length})
          </div>
          <span className="text-[11px] text-[#5d626b]">
            Allowlisted domains only · Zero hallucinated blogs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {research.citations.map((cit) => (
            <div
              key={cit.id}
              className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#5e6ad2]/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#5e6ad2]/15 text-[#8b95ff] border border-[#5e6ad2]/25">
                    {cit.domain}
                  </span>
                  {cit.isOfficialVendor && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#4daf73]/10 text-[#4daf73] border border-[#4daf73]/25 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>OFFICIAL</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-[#f7f8f8] line-clamp-2">{cit.title}</h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed line-clamp-3">
                  &ldquo;{cit.excerpt}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#5d626b]">
                  Relevance: {(cit.relevanceScore * 100).toFixed(0)}%
                </span>
                <a
                  href={cit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-[#8b95ff] hover:text-white transition"
                >
                  <span>Read Doc</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="space-y-4">
        <div className="text-xs font-mono font-medium text-[#8a8f98] uppercase tracking-wider">
          Synthesized Migration Findings & Architectural Prerequisites
        </div>

        <div className="space-y-3">
          {research.findings.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-2"
            >
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] text-[#8b95ff] border border-white/[0.08]">
                  {f.category.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-semibold text-[#f7f8f8]">{f.headline}</h4>
              </div>
              <p className="text-xs text-[#8a8f98] leading-relaxed pl-1">{f.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
