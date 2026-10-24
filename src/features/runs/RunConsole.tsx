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
  FileText,
  RotateCcw,
  Video,
  Radio,
  LockKeyhole,
  Check,
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
      <div className="p-16 text-center text-xs text-[#8a8f98]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8b95ff] mb-2" />
        Connecting to TinyFish Execution Stream...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-16 text-center text-xs text-[#8a8f98]">
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Human Approval Required Gate Banner */}
      {run.status === 'needs_approval' && (
        <div className="rounded-xl bg-[#0a0a0a] border border-[#e0a82e]/40 p-6 space-y-4 shadow-lg shadow-black/40">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#e0a82e]/10 text-[#e0a82e] flex items-center justify-center shrink-0 border border-[#e0a82e]/30">
              <LockKeyhole className="w-5 h-5 text-[#e0a82e]" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#e0a82e]/10 text-[#e0a82e] border border-[#e0a82e]/30">
                <span>Human-in-the-Loop Gate (APPROVE)</span>
              </div>
              <h2 className="text-base font-semibold text-[#f7f8f8] tracking-tight">
                Write Action Gate: Staged Mutation Awaiting Authorization
              </h2>
              <p className="text-xs text-[#8a8f98] leading-relaxed max-w-3xl">
                This task includes state-modifying actions on the legacy portal. In accordance with zero-trust governance, changes are staged below and will not be committed until you grant approval.
              </p>
            </div>
          </div>

          {/* Proposed Payload Staging View */}
          <div className="p-3 bg-black/60 rounded-lg border border-white/[0.08] text-xs font-mono">
            <div className="text-[10px] font-semibold text-[#e0a82e] uppercase tracking-wider mb-1">
              Staged Mutation Payload:
            </div>
            <pre className="text-[#c7c9cc] overflow-x-auto max-h-48 leading-relaxed">
              {JSON.stringify(run.extractedData || run.validatedData, null, 2)}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <input
              type="text"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Operator sign-off note (e.g. Verified reorder threshold adjustment)"
              className="flex-1 px-3 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-white placeholder-[#5d626b] focus:outline-none focus:border-[#e0a82e]"
            />
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleApprovalDecision('approved')}
                disabled={decidingApproval}
                className="px-4 py-2 rounded-lg bg-[#4daf73] hover:bg-[#5ec485] text-[#08090a] text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
                type="button"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{decidingApproval ? 'Committing…' : 'Approve Write'}</span>
              </button>
              <button
                onClick={() => handleApprovalDecision('rejected')}
                disabled={decidingApproval}
                className="px-4 py-2 rounded-lg bg-[#e05252]/20 hover:bg-[#e05252]/30 text-[#e05252] text-xs font-semibold border border-[#e05252]/30 transition flex items-center space-x-1.5 disabled:opacity-50"
                type="button"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Header Banner */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                run.status === 'succeeded'
                  ? 'bg-[#4daf73]/10 text-[#4daf73] border-[#4daf73]/30'
                  : run.status === 'failed' || run.status === 'validation_failed'
                  ? 'bg-[#e05252]/10 text-[#e05252] border-[#e05252]/30'
                  : 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30'
              }`}
            >
              {run.status.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-[#8a8f98]">{run.id}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#5d626b] font-mono">
              {run.executionMode === 'demo' ? 'SIMULATED TRACE' : 'LIVE AGENT'}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#f7f8f8] tracking-tight">
            Execution Run Console
          </h1>
          <div className="text-xs text-[#5d626b] mt-1 flex flex-wrap gap-3 font-mono">
            <span>Started: {new Date(run.startedAt).toLocaleTimeString()}</span>
            {run.completedAt && <span>Completed: {new Date(run.completedAt).toLocaleTimeString()}</span>}
            <span className="text-[#8b95ff] font-sans">
              Time Saved: <b>{run.timeSavedMinutes || 120} min</b> vs manual work
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          {run.validatedData && (
            <Link
              href={`/runs/${run.id}/results`}
              className="px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Explore Results</span>
            </Link>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] text-xs font-medium transition flex items-center space-x-1.5 disabled:opacity-50"
            title="Re-execute this task run"
            type="button"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin text-[#8b95ff]' : ''}`} />
            <span>{retrying ? 'Retrying…' : 'Re-Run'}</span>
          </button>
          <button
            onClick={fetchRun}
            className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] transition"
            title="Refresh Status"
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Timeline on Left, Replay & Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step Execution Timeline */}
        <div className="lg:col-span-2 rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <h2 className="font-semibold text-sm text-[#f7f8f8] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#8b95ff]" />
              <span>Step Execution Timeline</span>
            </h2>
            <span className="text-[10px] text-[#5d626b] font-mono">
              {pollingActive ? 'Streaming live…' : 'Completed'}
            </span>
          </div>

          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.08]">
            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#5d626b]">
                Initializing execution trace...
              </div>
            ) : (
              events.map((evt, idx) => {
                const isComplete = evt.status === 'completed';
                const isFailed = evt.status === 'failed';
                const eventName = evt.eventType || (evt as any).step || 'action';
                const eventTime = evt.createdAt || (evt as any).timestamp;
                return (
                  <div key={idx} className="relative flex items-start space-x-3 text-xs">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 -ml-7 ${
                        isComplete
                          ? 'bg-[#4daf73] text-black shadow-[0_0_8px_rgba(77,175,115,0.4)]'
                          : isFailed
                          ? 'bg-[#e05252] text-white'
                          : 'bg-[#8b95ff] text-black animate-pulse'
                      }`}
                    >
                      {isComplete ? <Check className="w-2.5 h-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </span>
                    <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#f7f8f8] capitalize">{eventName}</span>
                        <span className="text-[10px] font-mono text-[#5d626b]">
                          {eventTime ? new Date(eventTime).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8f98] mt-1">{evt.message}</p>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Right Col: Session Replay & Summary */}
        <div className="space-y-6">
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <span className="text-xs font-semibold text-[#f7f8f8] flex items-center space-x-2">
                <Video className="w-3.5 h-3.5 text-[#8b95ff]" />
                <span>TinyFish Cloud Replay</span>
              </span>
              <span className="text-[10px] font-mono text-[#4daf73]">WEBM RECORDED</span>
            </div>

            <div className="aspect-video bg-black rounded-lg border border-white/[0.08] flex items-center justify-center relative overflow-hidden group">
              <div className="text-center space-y-1.5">
                <Video className="w-7 h-7 mx-auto text-[#5d626b] group-hover:text-[#8b95ff] transition" />
                <span className="text-xs text-[#8a8f98] font-medium block">Live Replay Player</span>
                <span className="text-[10px] text-[#5d626b] font-mono block">TinyFish Session #tf-7882</span>
              </div>
            </div>

            {run.replayUrl && (
              <a
                href={run.replayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] text-[#c7c9cc] hover:text-white text-xs font-medium transition flex items-center justify-center space-x-1.5"
              >
                <span>Open Full Cloud Player</span>
                <ExternalLink className="w-3 h-3 text-[#5d626b]" />
              </a>
            )}
          </div>

          {/* Validation Metrics Panel */}
          {run.validationReport && (
            <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#f7f8f8]">
                <ShieldCheck className="w-4 h-4 text-[#4daf73]" />
                <span>Pydantic Trust Matrix</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.06]">
                  <span className="text-[#8a8f98]">Validation Score</span>
                  <span className="font-mono font-semibold text-[#4daf73]">{run.validationReport.score}%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.06]">
                  <span className="text-[#8a8f98]">Validation Checks</span>
                  <span className="font-mono text-[#c7c9cc]">
                    {run.validationReport.checks?.filter(c => c.passed).length || 0} / {run.validationReport.checks?.length || 3} Passed
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#8a8f98]">Drift Exceptions</span>
                  <span className="font-mono text-[#4daf73]">
                    {run.validationReport.errors?.length || 0} detected
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
