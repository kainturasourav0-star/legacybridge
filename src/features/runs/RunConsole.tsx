'use client';

import { useEffect, useState } from 'react';
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
  Video
} from 'lucide-react';
import { Run, RunEvent } from '@/types';

export function RunConsole({ runId }: { runId: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);

  const fetchRun = async () => {
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
  };

  useEffect(() => {
    fetchRun();
    let interval: NodeJS.Timeout;
    if (pollingActive) {
      interval = setInterval(fetchRun, 1500);
    }
    return () => clearInterval(interval);
  }, [runId, pollingActive]);

  if (loading && !run) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal mb-3" />
        Connecting to TinyFish Execution Stream...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        Run identifier not found.
      </div>
    );
  }

  const [approvalComments, setApprovalComments] = useState('');
  const [decidingApproval, setDecidingApproval] = useState(false);

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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Human Approval Required Gate Banner */}
      {run.status === 'needs_approval' && (
        <div className="bg-amber-50 rounded-card border-2 border-amber p-6 shadow-card space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber/20 text-amber-dark flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-dark" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-xs font-semibold text-amber-dark uppercase tracking-wider">
                Human-in-the-Loop Sign-Off Required (Pillar 2: APPROVE)
              </div>
              <h2 className="text-lg font-bold text-ink font-serif">
                Write Action Gate: Staged Mutation Awaiting Authorization
              </h2>
              <p className="text-xs text-slate-700">
                This task includes state-modifying actions. In accordance with zero-trust governance, changes are staged below and will not be committed until you grant approval.
              </p>
            </div>
          </div>

          {/* Proposed Payload Staging View */}
          <div className="p-3 bg-white rounded-lg border border-amber/30 text-xs font-mono">
            <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Staged Mutation Payload:</div>
            <pre className="text-slate-800 overflow-x-auto max-h-40">
              {JSON.stringify(run.extractedData || run.validatedData, null, 2)}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Operator sign-off note (e.g. Verified reorder threshold adjustment with procurement)"
              className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber/40"
            />
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleApprovalDecision('approved')}
                disabled={decidingApproval}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{decidingApproval ? 'Committing...' : 'Approve & Commit Mutation'}</span>
              </button>
              <button
                onClick={() => handleApprovalDecision('rejected')}
                disabled={decidingApproval}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Reject Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Header Banner */}
      <div className="bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                run.status === 'succeeded'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : run.status === 'failed' || run.status === 'validation_failed'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-dark border border-amber/40 animate-pulse'
              }`}
            >
              {run.status.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-slate-500">{run.id}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {run.executionMode === 'demo' ? 'DEMO FIXTURE (SIMULATED)' : 'LIVE TINYFISH API'}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-ink">Execution Run Console</h1>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-4">
            <span>Started: {new Date(run.startedAt).toLocaleString()}</span>
            {run.completedAt && <span>Completed: {new Date(run.completedAt).toLocaleString()}</span>}
            <span>Time Saved: <b>{run.timeSavedMinutes || 120} minutes</b> vs manual ERP work</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {run.validatedData && (
            <Link
              href={`/runs/${run.id}/results`}
              className="px-4 py-2.5 rounded-lg bg-teal hover:bg-teal-700 text-white text-sm font-semibold transition flex items-center space-x-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Explore Extracted Results</span>
            </Link>
          )}
          <button
            onClick={fetchRun}
            className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Timeline on Left, Replay & Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Timeline */}
        <div className="lg:col-span-2 bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-serif font-bold text-lg text-ink flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal" />
              <span>Step Execution Timeline</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {pollingActive ? 'Streaming live...' : 'Completed'}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Initializing execution trace...
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal ring-4 ring-white" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-sans">{evt.message}</p>
                    {evt.details && Object.keys(evt.details).length > 0 && (
                      <pre className="mt-2 p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
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
          <div className="bg-navy-950 text-white rounded-card border border-navy-800 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-white flex items-center space-x-2">
                <Video className="w-4 h-4 text-teal" />
                <span>TinyFish Session Replay</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal/20 text-mint border border-teal/40">
                VERIFIED
              </span>
            </div>

            <div className="bg-navy-900 rounded-lg p-4 border border-navy-800 space-y-3">
              <div className="text-xs text-slate-300">
                Live sandbox recording captured with full DOM mutations and screenshot checkpoints.
              </div>
              {run.replayUrl ? (
                <a
                  href={run.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded bg-teal hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <span>Open Full Session Video Replay</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="text-xs text-slate-500 font-mono">Awaiting stream URL...</div>
              )}
            </div>
          </div>

          {/* Validation Scorecard */}
          {run.validationReport && (
            <div className="bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-ink flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  <span>Validation Trust Report</span>
                </h3>
                <span className="text-xs font-bold text-teal font-mono">
                  Score: {run.validationReport.score}%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {run.validationReport.checks.map((chk, idx) => (
                  <div key={idx} className="flex items-start justify-between py-1 border-b border-slate-100 last:border-none">
                    <span className="text-slate-600">{chk.name}</span>
                    <span className={`font-semibold ${chk.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {chk.passed ? 'PASSED' : 'FLAGGED'}
                    </span>
                  </div>
                ))}
              </div>

              {run.validationReport.anomalies.length > 0 && (
                <div className="p-2.5 rounded bg-amber-50 text-amber-dark border border-amber/40 text-xs">
                  <div className="font-semibold mb-1">Anomalies Detected:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
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
