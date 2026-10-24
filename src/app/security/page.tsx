'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCode2,
  Lock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Finding } from '@/types';
import { SAMPLE_FINDINGS } from '@/fixtures/legacy_monolith';

export default function SecurityFindingsPage() {
  const [findings, setFindings] = useState<Finding[]>(SAMPLE_FINDINGS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filtered = selectedSeverity === 'all'
    ? findings
    : findings.filter((f) => f.severity === selectedSeverity);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#e05252]/15 border border-[#e05252]/30 text-[#e05252] text-xs font-mono font-medium mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>VULNERABILITY & TECHNICAL DEBT AUDIT</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Security & Architecture Findings
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Deterministic detection of SQL injection vectors, tight state coupling, hardcoded policy gates, and unhandled promise failures in legacy codebases.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'critical', 'high', 'medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition ${
                selectedSeverity === sev
                  ? 'bg-white/[0.1] text-[#f7f8f8] border border-white/[0.2]'
                  : 'bg-white/[0.03] text-[#8a8f98] border border-white/[0.06] hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold uppercase border ${
                    f.severity === 'critical'
                      ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                      : f.severity === 'high'
                      ? 'bg-[#e0a82e]/15 text-[#e0a82e] border-[#e0a82e]/30'
                      : 'bg-[#5e6ad2]/15 text-[#8b95ff] border-[#5e6ad2]/30'
                  }`}
                >
                  {f.severity}
                </span>
                <span className="text-xs font-mono text-[#5d626b] uppercase">{f.category}</span>
                <span className="text-xs font-mono text-[#8b95ff]">{f.id}</span>
              </div>
              <span className="text-xs font-mono text-[#5d626b]">
                {f.filePath}:{f.lineStart}-{f.lineEnd}
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#f7f8f8]">{f.title}</h3>
              <p className="text-xs text-[#8a8f98] mt-1.5 leading-relaxed">{f.explanation}</p>
            </div>

            {/* Evidence Snippet */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#5d626b] uppercase">Supporting Evidence:</span>
              <pre className="p-3 rounded-lg bg-[#050505] border border-white/[0.06] text-xs font-mono text-[#f7f8f8] overflow-x-auto">
                {f.evidence}
              </pre>
            </div>

            {/* Remediation */}
            <div className="p-3.5 rounded-lg bg-white/[0.025] border border-white/[0.06] text-xs space-y-1">
              <strong className="text-[#4daf73] block">Recommended Modernization Action:</strong>
              <p className="text-[#8a8f98]">{f.remediation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
