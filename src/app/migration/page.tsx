'use client';

import { useState, useEffect } from 'react';
import {
  GitFork,
  CheckCircle2,
  Clock,
  Layers3,
  Code2,
  FileCode2,
  Play,
  Download,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { MigrationPlan, ServiceCandidate, ServiceScaffold } from '@/types';
import { SAMPLE_MIGRATION_PLAN, SAMPLE_SERVICE_CANDIDATES } from '@/fixtures/legacy_monolith';

export default function MigrationPlannerPage() {
  const [plan, setPlan] = useState<MigrationPlan>(SAMPLE_MIGRATION_PLAN);
  const [candidates, setCandidates] = useState<ServiceCandidate[]>(SAMPLE_SERVICE_CANDIDATES);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('svc-orders');
  const [scaffold, setScaffold] = useState<ServiceScaffold | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const fetchScaffold = async (serviceId: string) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/scaffolds?serviceId=${serviceId}`);
      if (res.ok) {
        const data = await res.json();
        setScaffold(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprovePlan = async () => {
    setApproving(true);
    try {
      const res = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => {
    fetch('/api/migration')
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) setPlan(data.plan);
        if (data.candidates) setCandidates(data.candidates);
      })
      .catch((e) => console.error(e));

    fetchScaffold('svc-orders');
  }, []);

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <GitFork className="w-3.5 h-3.5" />
            <span>STRANGLER FIG DECOMPOSITION & SCAFFOLD STUDIO</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Microservices Migration Planner
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Plan safe, phased monolith-to-microservices migrations using the Strangler Fig pattern. Review target service boundaries, sign off on migration phases, and generate reviewable service scaffolds.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {plan.isApproved ? (
            <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#4daf73]/15 text-[#4daf73] border border-[#4daf73]/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Plan Approved by {plan.approvedBy || 'Lead Architect'}</span>
            </span>
          ) : (
            <button
              onClick={handleApprovePlan}
              disabled={approving}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#08090a]" />
              <span>{approving ? 'Approving Plan...' : 'Authorize Migration Plan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Strangler Fig Migration Phases */}
      <div className="space-y-4">
        <div className="text-xs font-mono font-medium text-[#8a8f98] uppercase tracking-wider">
          Phased Strangler Fig Rollout Schedule ({plan.phases.length} Phases)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {plan.phases.map((phase) => (
            <div
              key={phase.phaseNumber}
              className={`p-5 rounded-xl border space-y-3 flex flex-col justify-between ${
                phase.status === 'completed'
                  ? 'bg-[#4daf73]/5 border-[#4daf73]/25'
                  : phase.status === 'in_progress'
                  ? 'bg-[#5e6ad2]/10 border-[#8b95ff]/40 shadow-sm'
                  : 'bg-[#0a0a0a] border-white/[0.08]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#5d626b]">PHASE {phase.phaseNumber}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      phase.status === 'completed'
                        ? 'bg-[#4daf73]/15 text-[#4daf73]'
                        : phase.status === 'in_progress'
                        ? 'bg-[#5e6ad2]/20 text-[#8b95ff]'
                        : 'bg-white/[0.04] text-[#8a8f98]'
                    }`}
                  >
                    {phase.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#f7f8f8]">{phase.title}</h3>
                <div className="text-xs text-[#8a8f98]">
                  <strong>Strategy:</strong> {phase.strategy.replace('_', ' ')}
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-[#5d626b] uppercase block">Deliverables</span>
                  {phase.deliverables.map((d, i) => (
                    <div key={i} className="text-[11px] text-[#8a8f98] flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#8b95ff]" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-[#e0a82e]">
                <strong>Rollback Trigger:</strong> {phase.rollbackTrigger}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Scaffold Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Candidate Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-mono font-medium text-[#8a8f98] uppercase tracking-wider">
            Target Microservice Scaffolds
          </div>

          <div className="space-y-2">
            {candidates.map((c) => {
              const isSelected = selectedServiceId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedServiceId(c.id);
                    fetchScaffold(c.id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5e6ad2]/15 border-[#8b95ff] shadow-sm'
                      : 'bg-[#0a0a0a] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#8b95ff] uppercase">{c.domain}</span>
                    <span className="text-[9px] font-mono text-[#5d626b]">Order #{c.migrationOrder}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#f7f8f8]">{c.name}</h4>
                  <p className="text-xs text-[#8a8f98] mt-1 line-clamp-2">{c.responsibility}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#5d626b] pt-2 border-t border-white/[0.06]">
                    <span>Cohesion: {c.cohesionScore}</span>
                    <span>Coupling: {c.couplingScore}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Register Card */}
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#e0a82e] uppercase font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Migration Risk Register</span>
            </div>
            <div className="space-y-2">
              {plan.riskRegister.map((r, i) => (
                <div key={i} className="text-xs space-y-0.5 border-b border-white/[0.04] pb-2 last:border-0">
                  <div className="text-[#f7f8f8] font-medium">{r.risk}</div>
                  <div className="text-[11px] text-[#8a8f98]">{r.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scaffold Code Viewer */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono text-[#8b95ff] uppercase">Generated Scaffold</span>
              <h3 className="text-lg font-semibold text-[#f7f8f8] mt-0.5">
                {scaffold?.serviceName || 'Orders Service'} ({scaffold?.framework?.toUpperCase()})
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchScaffold(selectedServiceId)}
                disabled={generating}
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-[#8a8f98] hover:text-white transition"
                title="Regenerate Scaffold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin text-[#8b95ff]' : ''}`} />
              </button>
            </div>
          </div>

          {scaffold ? (
            <div className="space-y-4">
              {scaffold.files.map((file) => (
                <div key={file.path} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#5d626b]">
                    <div className="flex items-center space-x-2">
                      <FileCode2 className="w-3.5 h-3.5 text-[#8b95ff]" />
                      <span className="text-[#f7f8f8] font-semibold">{file.path}</span>
                      <span className="text-[11px] text-[#8a8f98]">&middot; {file.description}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(file.content, file.path)}
                      className="p-1 rounded hover:bg-white/[0.06] text-[#8a8f98] hover:text-white transition flex items-center gap-1"
                    >
                      {copiedFile === file.path ? <Check className="w-3 h-3 text-[#4daf73]" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copiedFile === file.path ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {file.hasTodoNotice && (
                    <div className="p-2.5 rounded bg-[#e0a82e]/10 border border-[#e0a82e]/25 text-[11px] text-[#e0a82e]">
                      <strong>Verification Notice:</strong> Explicit TODO comment inserted. Business rule requires human architectural validation before production cutover.
                    </div>
                  )}

                  <pre className="p-4 rounded-lg bg-[#050505] border border-white/[0.08] text-xs font-mono text-[#f7f8f8] overflow-x-auto max-h-[280px]">
                    {file.content}
                  </pre>
                </div>
              ))}

              {/* Dockerfile Preview */}
              <div className="pt-2 space-y-2">
                <div className="text-xs font-mono text-[#5d626b] flex items-center justify-between">
                  <span className="text-[#f7f8f8] font-semibold">Dockerfile</span>
                  <button
                    onClick={() => copyToClipboard(scaffold.dockerfile, 'Dockerfile')}
                    className="p-1 rounded hover:bg-white/[0.06] text-[#8a8f98] hover:text-white transition text-[10px]"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#050505] border border-white/[0.08] text-xs font-mono text-[#8a8f98] overflow-x-auto">
                  {scaffold.dockerfile}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-[#5d626b]">
              Loading service scaffold...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
