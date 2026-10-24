'use client';

import { useState, useEffect } from 'react';
import {
  SplitSquareVertical,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { DriftAnalysis, RegressionTestCase } from '@/types';
import { SAMPLE_DRIFT_ANALYSIS } from '@/fixtures/legacy_monolith';

export default function DriftDetectorPage() {
  const [analysis, setAnalysis] = useState<DriftAnalysis>(SAMPLE_DRIFT_ANALYSIS);
  const [running, setRunning] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const runLiveRegression = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/drift', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (e) {
      console.error('Failed to run drift detection:', e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetch('/api/drift')
      .then((r) => r.json())
      .then((data) => setAnalysis(data))
      .catch((e) => console.error(e));
  }, []);

  const activeItem = analysis.items[selectedItemIndex] || analysis.items[0];
  const activeTest = analysis.regressionTests.find((t) => t.driftItemId === activeItem?.id);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#e05252]/15 border border-[#e05252]/30 text-[#e05252] text-xs font-mono font-medium mb-3">
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>FLAGSHIP CAPABILITY · REVERSE REGRESSION ENGINE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Business Logic Drift Detector
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Extracts AST business rules from legacy monoliths, compares them with modernized service implementations, flags logic divergence, and executes live regression tests to prove rule integrity.
          </p>
        </div>

        <button
          onClick={runLiveRegression}
          disabled={running}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition shadow-lg shrink-0 disabled:opacity-50"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#08090a]" />
              <span>Running Regression Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Drift Regression</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
          <span className="text-[10px] font-mono text-[#5d626b] uppercase">Rules Compared</span>
          <div className="text-2xl font-semibold text-[#f7f8f8] mt-1">{analysis.totalRulesAnalyzed}</div>
          <span className="text-xs text-[#8a8f98] mt-1 block">AST extracted</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#e05252]/30 bg-[#e05252]/5">
          <span className="text-[10px] font-mono text-[#e05252] uppercase">Altered Rules</span>
          <div className="text-2xl font-semibold text-[#e05252] mt-1">{analysis.changedCount}</div>
          <span className="text-xs text-[#e05252]/80 mt-1 block">Logic drift confirmed</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#4daf73]/30 bg-[#4daf73]/5">
          <span className="text-[10px] font-mono text-[#4daf73] uppercase">Identical Matches</span>
          <div className="text-2xl font-semibold text-[#4daf73] mt-1">{analysis.matchesCount}</div>
          <span className="text-xs text-[#4daf73]/80 mt-1 block">Zero drift verified</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
          <span className="text-[10px] font-mono text-[#5d626b] uppercase">Regression Status</span>
          <div className="text-2xl font-semibold text-[#e0a82e] mt-1">
            {analysis.regressionTests.filter((t) => !t.passed).length} Failed
          </div>
          <span className="text-xs text-[#8a8f98] mt-1 block">Action required</span>
        </div>
      </div>

      {/* Main Drift Comparison Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drift Rule Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-medium text-[#8a8f98] uppercase tracking-wider px-1">
            Detected Rule Divergences ({analysis.items.length})
          </div>

          <div className="space-y-2">
            {analysis.items.map((item, idx) => {
              const isSelected = selectedItemIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5e6ad2]/10 border-[#5e6ad2]/40 shadow-sm'
                      : 'bg-[#0a0a0a] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#8b95ff] uppercase">{item.domain}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                        item.status === 'CHANGED'
                          ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                          : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">{item.ruleName}</h3>
                  <p className="text-xs text-[#8a8f98] mt-1 line-clamp-2">{item.detectedDifference}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#5d626b] pt-2 border-t border-white/[0.06]">
                    <span>{item.originalFile}</span>
                    <span>Severity: {item.severity.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demonstration Callout */}
          <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.08] text-xs text-[#8a8f98] space-y-2">
            <div className="flex items-center space-x-2 text-[#8b95ff]">
              <Info className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Demonstration Scenario</span>
            </div>
            <p>
              The sample Acme monolith contains a strict corporate credit cutoff at <strong>650</strong>. During refactoring, a developer mistakenly raised the threshold to <strong>675</strong>. LegacyBridge ran a regression test with customer score 660, capturing the exact failure.
            </p>
          </div>
        </div>

        {/* Right Column: Rule Diff & Regression Evidence Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {activeItem && (
            <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8b95ff]">{activeItem.id}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#8a8f98] border border-white/[0.08]">
                    Confidence: {(activeItem.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-[#f7f8f8] mt-1">{activeItem.ruleName}</h2>
                <div className="mt-2 p-3 rounded-lg bg-[#e05252]/10 border border-[#e05252]/25 text-xs text-[#e05252]">
                  <strong>Business Impact:</strong> {activeItem.businessImpact}
                </div>
              </div>

              {/* Side-by-Side Code Diff */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#8a8f98] uppercase">AST Code Comparison</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Monolith */}
                  <div className="p-3.5 rounded-lg bg-[#050505] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#5d626b]">
                      <span>Original Monolith</span>
                      <span>{activeItem.originalLines}</span>
                    </div>
                    <pre className="text-xs font-mono text-[#f7f8f8] bg-black/40 p-2.5 rounded overflow-x-auto whitespace-pre-wrap">
                      {activeItem.originalSnippet}
                    </pre>
                  </div>

                  {/* Modernized Target */}
                  <div className="p-3.5 rounded-lg bg-[#e05252]/5 border border-[#e05252]/25 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#e05252]">
                      <span>Modernized Service (Altered)</span>
                      <span>{activeItem.modernizedLines}</span>
                    </div>
                    <pre className="text-xs font-mono text-[#f7f8f8] bg-black/40 p-2.5 rounded overflow-x-auto whitespace-pre-wrap">
                      {activeItem.modernizedSnippet}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Live Regression Test Verification Box */}
              {activeTest && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#8b95ff]" />
                      <span className="text-xs font-semibold text-[#f7f8f8]">Targeted Regression Test Verification</span>
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                        activeTest.passed
                          ? 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                          : 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                      }`}
                    >
                      {activeTest.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{activeTest.passed ? 'PASSED' : 'REGRESSION FAILED'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#8a8f98]">{activeTest.testName}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-black/40 border border-white/[0.06]">
                      <span className="text-[#5d626b] block mb-1">Expected Output (Monolith):</span>
                      <pre className="text-[#4daf73] whitespace-pre-wrap">
                        {JSON.stringify(activeTest.expectedOutput, null, 2)}
                      </pre>
                    </div>
                    <div className="p-2.5 rounded bg-black/40 border border-[#e05252]/20">
                      <span className="text-[#e05252] block mb-1">Observed Output (Modern):</span>
                      <pre className="text-[#e05252] whitespace-pre-wrap">
                        {JSON.stringify(activeTest.actualModernOutput, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {activeTest.failureReason && (
                    <div className="text-xs font-mono text-[#e05252] bg-[#e05252]/10 p-2.5 rounded border border-[#e05252]/20">
                      {activeTest.failureReason}
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Action */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <div className="text-xs text-[#8a8f98]">
                  <strong>Recommended Remediation:</strong> {activeItem.recommendedAction}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
