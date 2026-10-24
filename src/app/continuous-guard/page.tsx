'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  GitPullRequest,
  GitCommit,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  FileCode2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ContinuousGuardCheck } from '@/types';

export default function ContinuousGuardPage() {
  const [guard, setGuard] = useState<ContinuousGuardCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [testFileChange, setTestFileChange] = useState('services/orders/fulfillment.js');

  const fetchGuard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/guard');
      const json = await res.json();
      setGuard(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuard();
  }, []);

  const handleSimulateCommit = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changedFiles: [testFileChange],
          commitMessage: 'refactor: modify order fulfillment logic',
        }),
      });
      const json = await res.json();
      setGuard(json);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4daf73]/15 border border-[#4daf73]/30 text-[#4daf73] text-xs font-mono font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CONTINUOUS MIGRATION GUARD · CI/CD REGRESSION SHIELD</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Continuous Migration Guard
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl leading-relaxed">
            Automated blast-radius analysis across Git commits and pull requests. Maps source diffs to affected business rules, re-executes targeted regression suites, and flags unintended behavioral drift.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleSimulateCommit}
            disabled={checking}
            className="px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <GitPullRequest className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Analyzing Diff…' : 'Simulate Pull Request'}</span>
          </button>
        </div>
      </div>

      {/* Live Pull Request / Revision Status Card */}
      <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8b95ff]">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#8a8f98]">
                REVISION COMPARISON: <span className="text-[#c7c9cc]">{guard?.previousRevision}</span> &rarr;{' '}
                <strong className="text-[#8b95ff]">{guard?.newRevision}</strong>
              </div>
              <h3 className="text-base font-semibold text-[#f7f8f8] mt-0.5">
                {guard?.commitMessage || 'refactor: streamline order fulfillment pipeline'}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${
                guard?.guardStatus === 'regressions_detected'
                  ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                  : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
              }`}
            >
              {guard?.guardStatus === 'regressions_detected'
                ? 'REGRESSIONS DETECTED · MERGE BLOCKED'
                : 'CLEAN · NO REGRESSIONS'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#5d626b] pt-2 border-t border-white/[0.04]">
          <span>Author: <strong className="text-[#8a8f98]">{guard?.author || 'engineer@acme-corp.com'}</strong></span>
          <span>·</span>
          <span>Trigger: <strong className="text-[#8a8f98]">{guard?.trigger.toUpperCase()}</strong></span>
          <span>·</span>
          <span>Regression Suites Run: <strong className="text-white">{guard?.regressionTestsRun} tests</strong></span>
        </div>
      </div>

      {/* Blast Radius Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Changed Files */}
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8f98] uppercase">1. Changed Files</span>
            <span className="text-[#8b95ff] font-bold">{guard?.changedFiles.length}</span>
          </div>
          <div className="space-y-1.5">
            {guard?.changedFiles.map((file, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-black/60 border border-white/[0.04] text-xs font-mono text-[#c7c9cc] flex items-center space-x-2"
              >
                <FileCode2 className="w-3.5 h-3.5 text-[#e0a82e] shrink-0" />
                <span className="truncate">{file}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Modules */}
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8f98] uppercase">2. Affected Services</span>
            <span className="text-[#8b95ff] font-bold">{guard?.affectedModules.length}</span>
          </div>
          <div className="space-y-1.5">
            {guard?.affectedModules.map((mod, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-black/60 border border-white/[0.04] text-xs font-mono text-[#8b95ff] flex items-center justify-between"
              >
                <span>{mod}</span>
                <span className="text-[10px] text-[#5d626b]">Blast Radius</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impacted Business Rules */}
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8f98] uppercase">3. Targeted Regression Rules</span>
            <span className="text-[#e05252] font-bold">{guard?.affectedRules.length}</span>
          </div>
          <div className="space-y-1.5">
            {guard?.affectedRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-black/60 border border-white/[0.04] text-xs font-mono text-[#e05252] flex items-center space-x-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CI/CD Integration Prompt */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#f7f8f8]">GitHub Actions CI/CD Integration</h3>
          <p className="text-xs text-[#8a8f98]">
            LegacyBridge runs as a GitHub Pull Request check, blocking automatic merges whenever behavior drift is confirmed.
          </p>
        </div>
        <Link
          href="/drift"
          className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white text-xs font-medium transition shrink-0"
        >
          <span>Review Failing Rules in Drift Studio &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
