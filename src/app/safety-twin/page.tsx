'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  SplitSquareVertical,
  ArrowRight,
  Download,
  Terminal,
} from 'lucide-react';
import { SafetyTwinComparison, TwinScenario } from '@/types';

export default function SafetyTwinPage() {
  const [data, setData] = useState<SafetyTwinComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  const fetchTwinData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/twin');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to load safety twin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinData();
  }, []);

  const handleRunRerun = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/twin', { method: 'POST' });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const selectedScenario: TwinScenario | undefined = data?.scenarios[selectedScenarioIndex];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Boxes className="w-3.5 h-3.5" />
            <span>MIGRATION SAFETY TWIN · BEHAVIORAL EQUIVALENCE ENGINE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Migration Safety Twin
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl leading-relaxed">
            Side-by-side behavior comparison workspace. Applies identical controlled test payloads to the original legacy monolith and the modernized microservice to verify zero behavioral divergence.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRunRerun}
            disabled={running}
            className="px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Executing Dual Runs…' : 'Rerun Dual Scenarios'}</span>
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `safety-twin-report-${Date.now()}.json`;
              a.click();
            }}
            className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Evidence</span>
          </button>
        </div>
      </div>

      {/* Revision Meta Card */}
      <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-[#5d626b]">ORIGINAL TARGET:</span>{' '}
            <strong className="text-[#f7f8f8]">{data?.originalRevision || 'v1.4.2-monolith'}</strong>
          </div>
          <span className="text-[#5d626b]">vs</span>
          <div>
            <span className="text-[#5d626b]">MIGRATED CANDIDATE:</span>{' '}
            <strong className="text-[#8b95ff]">{data?.proposedRevision || 'v2.0.0-candidate'}</strong>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
              (data?.mismatchesCount || 0) > 0
                ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
            }`}
          >
            {(data?.mismatchesCount || 0) > 0 ? `${data?.mismatchesCount} MISMATCHES DETECTED` : '100% PARITY'}
          </span>
          <span className="text-[#8a8f98]">
            Status: <strong className="text-white">{data?.reviewStatus.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenarios List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-medium text-[#8a8f98] uppercase tracking-wider px-1">
            Test Scenarios ({data?.scenarios.length || 0})
          </div>

          <div className="space-y-2">
            {data?.scenarios.map((scen, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              return (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenarioIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5e6ad2]/10 border-[#5e6ad2]/40 shadow-sm'
                      : 'bg-[#0a0a0a] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#8b95ff] uppercase">{scen.domain}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                        scen.status === 'MISMATCH'
                          ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                          : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                      }`}
                    >
                      {scen.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">{scen.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#5d626b] pt-2 border-t border-white/[0.06]">
                    <span>Lat: {scen.executionTimeMs}ms</span>
                    <span className="text-[#8a8f98]">Inspect Side-by-Side &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Side-by-Side Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {selectedScenario ? (
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8b95ff] uppercase">{selectedScenario.domain}</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedScenario.status === 'MISMATCH'
                        ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                        : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                    }`}
                  >
                    {selectedScenario.status}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#f7f8f8] mt-1">{selectedScenario.name}</h2>
                {selectedScenario.divergenceExplanation && (
                  <div className="p-3 mt-3 rounded-lg bg-[#e05252]/10 border border-[#e05252]/20 flex items-start space-x-2 text-xs text-[#f7f8f8]">
                    <AlertTriangle className="w-4 h-4 text-[#e05252] shrink-0 mt-0.5" />
                    <span>{selectedScenario.divergenceExplanation}</span>
                  </div>
                )}
              </div>

              {/* Controlled Input Payload */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-[#8a8f98] uppercase">Controlled Input Payload:</div>
                <pre className="p-3 rounded-lg bg-black border border-white/[0.06] text-xs font-mono text-[#c7c9cc] overflow-x-auto">
                  {JSON.stringify(selectedScenario.inputPayload, null, 2)}
                </pre>
              </div>

              {/* Side-by-Side Outputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Legacy Output */}
                <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8a8f98]">ORIGINAL MONOLITH</span>
                    <code className="text-[#4daf73] text-[10px]">{selectedScenario.originalSourceRef}</code>
                  </div>
                  <pre className="p-3 rounded bg-[#070708] text-xs font-mono text-[#4daf73] overflow-x-auto">
                    {JSON.stringify(selectedScenario.originalOutput, null, 2)}
                  </pre>
                </div>

                {/* Proposed Modern Output */}
                <div
                  className={`p-4 rounded-xl bg-black border space-y-2 ${
                    selectedScenario.status === 'MISMATCH' ? 'border-[#e05252]/40' : 'border-[#4daf73]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={selectedScenario.status === 'MISMATCH' ? 'text-[#e05252]' : 'text-[#4daf73]'}>
                      PROPOSED MICROSERVICE
                    </span>
                    <code className="text-[#8b95ff] text-[10px]">{selectedScenario.proposedSourceRef}</code>
                  </div>
                  <pre
                    className={`p-3 rounded bg-[#070708] text-xs font-mono overflow-x-auto ${
                      selectedScenario.status === 'MISMATCH' ? 'text-[#e05252]' : 'text-[#4daf73]'
                    }`}
                  >
                    {JSON.stringify(selectedScenario.proposedOutput, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Next Steps Prompt */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#5d626b] font-mono">Execution time: {selectedScenario.executionTimeMs}ms</span>
                <Link
                  href="/drift"
                  className="text-[#8b95ff] hover:underline font-mono flex items-center space-x-1"
                >
                  <span>Open Full Drift Regression Studio &rarr;</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#8a8f98] rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
              Select a test scenario from the list to inspect side-by-side execution output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
