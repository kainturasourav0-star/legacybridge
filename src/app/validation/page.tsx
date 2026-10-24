'use client';

import { useState } from 'react';
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_DRIFT_ANALYSIS } from '@/fixtures/legacy_monolith';

export default function ValidationHubPage() {
  const [running, setRunning] = useState(false);
  const [tests, setTests] = useState(SAMPLE_DRIFT_ANALYSIS.regressionTests);

  const runAllTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/drift', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTests(data.regressionTests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>SAFE TEST EXECUTION SANDBOX · REGRESSION ORCHESTRATOR</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Validation & Regression Hub
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Execute unit tests, regression suites, and boundary value checks across legacy and modernized services in an isolated environment with runtime constraints.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={running}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition shadow-md shrink-0 disabled:opacity-50"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#08090a]" />
              <span>Executing Tests...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Full Validation Suite</span>
            </>
          )}
        </button>
      </div>

      {/* Tests Execution List */}
      <div className="space-y-4">
        <div className="text-xs font-mono text-[#8a8f98] uppercase tracking-wider">
          Automated Test Verifications ({tests.length})
        </div>

        <div className="space-y-3">
          {tests.map((t) => (
            <div
              key={t.id}
              className={`p-5 rounded-xl border space-y-3 ${
                t.passed
                  ? 'bg-[#0a0a0a] border-[#4daf73]/25'
                  : 'bg-[#0a0a0a] border-[#e05252]/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                      t.passed
                        ? 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                        : 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                    }`}
                  >
                    {t.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{t.passed ? 'PASSED' : 'FAILED'}</span>
                  </span>
                  <span className="text-xs font-mono text-[#5d626b]">{t.id}</span>
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">{t.testName}</h3>
                </div>
                <span className="text-xs font-mono text-[#5d626b] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.executionTimeMs} ms</span>
                </span>
              </div>

              {t.failureReason && (
                <div className="p-3 rounded-lg bg-[#e05252]/10 border border-[#e05252]/20 text-xs font-mono text-[#e05252]">
                  {t.failureReason}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-3 rounded bg-[#050505] border border-white/[0.06]">
                  <span className="text-[#5d626b] block mb-1">Permitted Input Payload:</span>
                  <pre className="text-[#f7f8f8] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(t.inputPayload, null, 2)}
                  </pre>
                </div>
                <div className="p-3 rounded bg-[#050505] border border-white/[0.06]">
                  <span className="text-[#5d626b] block mb-1">Expected Baseline Output:</span>
                  <pre className="text-[#4daf73] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(t.expectedOutput, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
