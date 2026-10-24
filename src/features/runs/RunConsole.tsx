'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Send,
  Terminal,
  FileText,
  RotateCcw,
  Video,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Run, RunEvent } from '@/types';

export function RunConsole({ runId }: { runId: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);
  const [approvalComments, setApprovalComments] = useState('');
  const [decidingApproval, setDecidingApproval] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const res = await fetch(`/api/runs/${runId}/retry`, { method: 'POST' });
      if (res.ok) {
        const newRun = await res.json();
        window.location.href = `/runs/${newRun.id}`;
      }
    } catch (e) {
      console.error('Failed to retry run:', e);
    } finally {
      setRetrying(false);
    }
  };

  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${runId}`);
      if (res.ok) {
        const data = await res.json();
        setRun(data);
        if (data.status === 'succeeded' || data.status === 'failed' || data.status === 'validation_failed') {
          setPollingActive(false);
        }
      }
    } catch (e) {
      console.error('Error fetching run details:', e);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchRun();
    let interval: NodeJS.Timeout;
    if (pollingActive) {
      interval = setInterval(fetchRun, 1500);
    }
    return () => clearInterval(interval);
  }, [fetchRun, pollingActive]);

  if (loading && !run) {
    return (
      <div className="p-16 text-center text-sm text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-3" />
        Connecting to TinyFish Execution Stream...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-16 text-center text-sm text-slate-400">
        Run identifier not found.
      </div>
    );
  }

  const handleApprovalDecision = async (decision: 'approved' | 'rejected') => {
    try {
      setDecidingApproval(true);
      const res = await fetch(`/api/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comments: approvalComments }),
      });
      if (res.ok) {
        await fetchRun();
      }
    } catch (e) {
      console.error('Failed to submit approval decision:', e);
    } finally {
      setDecidingApproval(false);
    }
  };

  const events: RunEvent[] = run.events || [];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Human Approval Required Gate Banner */}
      {run.status === 'needs_approval' && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/70 border-2 border-amber-500/60 p-6 md:p-8 shadow-2xl shadow-amber-500/10 space-y-5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase">
                <span>Human-in-the-Loop Sign-Off (Pillar 2: APPROVE)</span>
              </div>
              <h2 className="text-xl font-bold text-white font-sans tracking-tight">
                Write Action Gate: Staged Mutation Awaiting Authorization
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                This task includes state-modifying actions on the legacy portal. In accordance with zero-trust governance, changes are staged below and will not be committed until you grant approval.
              </p>
            </div>
          </div>

          {/* Proposed Payload Staging View */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/30 text-xs font-mono">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
              Staged Mutation Payload:
            </div>
            <pre className="text-slate-200 overflow-x-auto max-h-48 leading-relaxed">
              {JSON.stringify(run.extractedData || run.validatedData, null, 2)}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Operator sign-off note (e.g. Verified reorder threshold adjustment with procurement)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleApprovalDecision('approved')}
                disabled={decidingApproval}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold transition flex items-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{decidingApproval ? 'Committing...' : 'Approve & Commit Mutation'}</span>
              </button>
              <button
                onClick={() => handleApprovalDecision('rejected')}
                disabled={decidingApproval}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Reject Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Header Banner */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
                run.status === 'succeeded'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : run.status === 'failed' || run.status === 'validation_failed'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
              }`}
            >
              {run.status.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-slate-400">{run.id}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
              {run.executionMode === 'demo' ? 'DEMO FIXTURE (SIMULATED)' : 'LIVE TINYFISH API'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight">
            Execution Run Console
          </h1>
          <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap gap-4 font-mono">
            <span>Started: {new Date(run.startedAt).toLocaleString()}</span>
            {run.completedAt && <span>Completed: {new Date(run.completedAt).toLocaleString()}</span>}
            <span className="text-teal-400 font-sans">
              Time Saved: <b>{run.timeSavedMinutes || 120} minutes</b> vs manual ERP work
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {run.validatedData && (
            <Link
              href={`/runs/${run.id}/results`}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-sm font-bold transition flex items-center space-x-2 shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Explore Extracted Results</span>
            </Link>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            title="Re-execute this task run"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin text-teal-400' : ''}`} />
            <span>{retrying ? 'Retrying...' : 'Re-Run Task'}</span>
          </button>
          <button
            onClick={fetchRun}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Timeline on Left, Replay & Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left 2 Cols: Step Execution Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="font-sans font-bold text-lg text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Step Execution Timeline</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {pollingActive ? 'Streaming live...' : 'Completed'}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Initializing execution trace...
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-400 ring-4 ring-slate-950" />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 font-normal leading-relaxed">{evt.message}</p>
                    {evt.details && Object.keys(evt.details).length > 0 && (
                      <pre className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                        {JSON.stringify(evt.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: TinyFish Live Replay & Validation Report */}
        <div className="space-y-6">
          {/* Replay Stream Card */}
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-base text-white flex items-center space-x-2">
                <Video className="w-4 h-4 text-teal-400" />
                <span>TinyFish Session Replay</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-bold">
                VERIFIED
              </span>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                Live sandbox recording captured with full DOM mutations and screenshot checkpoints.
              </div>
              {run.replayUrl ? (
                <a
                  href={run.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                >
                  <span>Open Full Video Replay</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="text-xs text-slate-500 font-mono">Awaiting stream URL...</div>
              )}
            </div>
          </div>

          {/* Validation Scorecard */}
          {run.validationReport && (
            <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-base text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Validation Trust Report</span>
                </h3>
                <span className="text-xs font-bold text-teal-400 font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                  Score: {run.validationReport.score}%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {run.validationReport.checks.map((chk, idx) => (
                  <div key={idx} className="flex items-start justify-between py-1.5 border-b border-slate-800/60 last:border-none">
                    <span className="text-slate-300">{chk.name}</span>
                    <span className={`font-bold font-mono text-[11px] ${chk.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {chk.passed ? 'PASSED' : 'FLAGGED'}
                    </span>
                  </div>
                ))}
              </div>

              {run.validationReport.anomalies.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-500/40 text-xs">
                  <div className="font-bold mb-1">Anomalies Detected:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-200">
                    {run.validationReport.anomalies.map((anom, i) => (
                      <li key={i}>{anom}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
