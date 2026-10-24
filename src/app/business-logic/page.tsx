'use client';

import { useState } from 'react';
import {
  ScrollText,
  ShieldCheck,
  Search,
  Filter,
  FileCode2,
  CheckCircle2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { BusinessRule } from '@/types';
import { SAMPLE_BUSINESS_RULES } from '@/fixtures/legacy_monolith';

export default function BusinessLogicPage() {
  const [rules, setRules] = useState<BusinessRule[]>(SAMPLE_BUSINESS_RULES);
  const [search, setSearch] = useState('');
  const [selectedRule, setSelectedRule] = useState<BusinessRule>(SAMPLE_BUSINESS_RULES[0]);

  const filteredRules = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.domain.toLowerCase().includes(search.toLowerCase()) ||
      r.filePath.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <ScrollText className="w-3.5 h-3.5" />
            <span>AST RULE EXTRACTION & SPECIFICATION RECOVERY</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Business Logic Catalog
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Deterministic extraction of embedded calculations, threshold gates, discount schedules, and decision logic trapped inside legacy monolith procedural code.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5d626b] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules, files, domains..."
            className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#8b95ff]"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-[#8a8f98] uppercase tracking-wider">
            Recovered Business Rules ({filteredRules.length})
          </div>

          <div className="space-y-2">
            {filteredRules.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#5e6ad2]/15 border-[#8b95ff] shadow-sm'
                      : 'bg-[#0a0a0a] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8b95ff] uppercase">{rule.domain}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#8a8f98]">
                      {rule.ruleCategory}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">{rule.name}</h3>
                  <div className="text-xs font-mono text-[#5d626b]">
                    {rule.filePath}:{rule.lineStart}-{rule.lineEnd}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Rule Specification Inspector */}
        <div className="lg:col-span-7">
          {selectedRule && (
            <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8b95ff]">{selectedRule.id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4daf73]/10 text-[#4daf73] border border-[#4daf73]/25 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>DETERMINISTIC · 99% CONFIDENCE</span>
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-[#f7f8f8] mt-1">{selectedRule.name}</h2>
                <div className="text-xs font-mono text-[#5d626b] mt-1">
                  Location: {selectedRule.filePath} (Lines {selectedRule.lineStart} to {selectedRule.lineEnd})
                </div>
              </div>

              {/* Normalized Condition & Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-[#050505] border border-white/[0.08] space-y-1">
                  <span className="text-[#5d626b] uppercase text-[10px] block">Condition Predicate</span>
                  <p className="text-[#f7f8f8] break-words">{selectedRule.conditionExpression}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#050505] border border-white/[0.08] space-y-1">
                  <span className="text-[#5d626b] uppercase text-[10px] block">Outcome Formulation</span>
                  <p className="text-[#4daf73] break-words">{selectedRule.outcomeExpression}</p>
                </div>
              </div>

              {/* Raw Monolith Source Snippet */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#8a8f98] uppercase">Source AST Snippet</span>
                <pre className="p-4 rounded-lg bg-[#050505] border border-white/[0.08] text-xs font-mono text-[#f7f8f8] overflow-x-auto whitespace-pre-wrap">
                  {selectedRule.rawSnippet}
                </pre>
              </div>

              {/* Input Parameters */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#8a8f98] uppercase">Evaluated Parameters ({selectedRule.parameters.length})</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedRule.parameters.map((p) => (
                    <div key={p.name} className="p-2.5 rounded bg-white/[0.025] border border-white/[0.06] text-xs font-mono">
                      <span className="text-[#8b95ff] block">{p.name}</span>
                      <span className="text-[10px] text-[#5d626b]">{p.type} {p.defaultValue ? `(default: ${p.defaultValue})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
