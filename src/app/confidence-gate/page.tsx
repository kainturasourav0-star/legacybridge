'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  FileText,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { ConfidenceGateReport, ConfidenceDimension } from '@/types';

export default function ConfidenceGatePage() {
  const [gate, setGate] = useState<ConfidenceGateReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOffOperator, setSignOffOperator] = useState('Sourav Kaintura (Principal Architect)');
  const [signOffJustification, setSignOffJustification] = useState(
    'Reviewed Phase 1 Strangler boundary and accepted dual-write inventory replication exception.'
  );
  const [signingOff, setSigningOff] = useState(false);

  const fetchGate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gate');
      const json = await res.json();
      setGate(json);
    } catch (e) {
      console.error('Failed to load confidence gate report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGate();
  }, []);

  const handleSignOff = async () => {
    setSigningOff(true);
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign_off',
          approvedBy: signOffOperator,
          justification: signOffJustification,
        }),
      });
      const updated = await res.json();
      setGate(updated);
    } catch (e) {
      console.error('Failed to sign off gate:', e);
    } finally {
      setSigningOff(false);
    }
  };

  const blockedDimensions = gate?.dimensions.filter((d) => d.status === 'blocked') || [];
  const failedDimensions = gate?.dimensions.filter((d) => d.status === 'fail') || [];
  const passedDimensions = gate?.dimensions.filter((d) => d.status === 'pass') || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#e05252]/15 border border-[#e05252]/30 text-[#e05252] text-xs font-mono font-medium mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>MIGRATION CONFIDENCE GATE · EVIDENCE-BASED READINESS AUDIT</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Migration Confidence Gate
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl leading-relaxed">
            Evaluates 10 separate verification dimensions before production migration. Blocks automated readiness claims when unresolved regressions, coupling bottlenecks, or unverified assumptions exist.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchGate}
            className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition shadow-sm"
            title="Refresh Gate Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b95ff]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Gate Summary Status Banner */}
      <div
        className={`p-6 rounded-2xl border ${
          gate?.humanApprovalStatus === 'approved'
            ? 'bg-[#4daf73]/10 border-[#4daf73]/30'
            : 'bg-[#e05252]/10 border-[#e05252]/30'
        } space-y-4`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {gate?.humanApprovalStatus === 'approved' ? (
              <Unlock className="w-8 h-8 text-[#4daf73] shrink-0" />
            ) : (
              <Lock className="w-8 h-8 text-[#e05252] shrink-0" />
            )}
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase">
                {gate?.humanApprovalStatus === 'approved' ? 'GATE STATUS: AUTHORIZED' : 'GATE STATUS: BLOCKED'}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-[#f7f8f8] mt-0.5">
                {gate?.humanApprovalStatus === 'approved'
                  ? 'Human Operator Sign-Off Recorded'
                  : 'Automatic Readiness Claims Blocked by Policy'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-black/40 border border-white/[0.08] text-[#c7c9cc]">
              {passedDimensions.length} Passed
            </span>
            <span className="px-2.5 py-1 rounded bg-[#e05252]/20 border border-[#e05252]/30 text-[#e05252] font-bold">
              {blockedDimensions.length} Blocked
            </span>
            <span className="px-2.5 py-1 rounded bg-[#e0a82e]/20 border border-[#e0a82e]/30 text-[#e0a82e]">
              {failedDimensions.length} Open Issues
            </span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-[#c7c9cc] leading-relaxed">
          {gate?.summary}
        </p>

        {gate?.approvalSignOff && (
          <div className="p-3 rounded-lg bg-black/50 border border-white/[0.08] text-xs font-mono text-[#8a8f98] space-y-1">
            <div>
              Approved By: <strong className="text-white">{gate.approvalSignOff.approvedBy}</strong> at{' '}
              {new Date(gate.approvalSignOff.approvedAt).toLocaleTimeString()}
            </div>
            <div>Justification: &ldquo;{gate.approvalSignOff.justification}&rdquo;</div>
          </div>
        )}
      </div>

      {/* 10-Dimension Audit Checklist */}
      <div className="space-y-4">
        <div className="text-xs font-mono font-bold text-[#8a8f98] uppercase tracking-wider px-1">
          10 Verification Dimensions (Evidence-Backed)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gate?.dimensions.map((dim) => {
            return (
              <div
                key={dim.id}
                className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.16] transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">{dim.title}</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      dim.status === 'pass'
                        ? 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                        : dim.status === 'blocked'
                        ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                        : dim.status === 'fail'
                        ? 'bg-[#e0a82e]/15 text-[#e0a82e] border-[#e0a82e]/30'
                        : 'bg-white/[0.04] text-[#8a8f98] border-white/[0.08]'
                    }`}
                  >
                    {dim.status}
                  </span>
                </div>

                <p className="text-xs text-[#8a8f98] leading-relaxed">
                  <strong className="text-[#c7c9cc]">Evidence:</strong> {dim.evidence}
                </p>

                <div className="text-[11px] text-[#5d626b] font-mono">
                  Recommended Action: <span className="text-[#8b95ff]">{dim.recommendedAction}</span>
                </div>

                {dim.references.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
                    {dim.references.map((ref, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-black text-[10px] font-mono text-[#8a8f98] border border-white/[0.06]"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Human Approval Gate Panel */}
      <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.12] space-y-4">
        <div className="flex items-center space-x-2 text-[#8b95ff]">
          <UserCheck className="w-5 h-5" />
          <h3 className="text-base font-semibold text-[#f7f8f8]">
            Mandatory Operator Authorization Gate
          </h3>
        </div>
        <p className="text-xs text-[#8a8f98] max-w-2xl leading-relaxed">
          LegacyBridge policy prohibits automated cutovers. Before applying microservice scaffolds or cutting over DNS traffic, an authorized architect must review the gate blockers and record a signed justification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <label className="space-y-1 block">
            <span className="text-[#8a8f98]">OPERATOR IDENTITY:</span>
            <input
              type="text"
              value={signOffOperator}
              onChange={(e) => setSignOffOperator(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black border border-white/[0.12] text-white focus:border-[#8b95ff] outline-none"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[#8a8f98]">JUSTIFICATION / WAIVER RECORD:</span>
            <input
              type="text"
              value={signOffJustification}
              onChange={(e) => setSignOffJustification(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black border border-white/[0.12] text-white focus:border-[#8b95ff] outline-none"
            />
          </label>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleSignOff}
            disabled={signingOff}
            className="px-5 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {signingOff ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Authorization…</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Record Human Sign-Off</span>
              </>
            )}
          </button>
          <Link
            href="/drift"
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white text-xs font-medium transition"
          >
            <span>Resolve Slide 5 Drift Blockers &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
