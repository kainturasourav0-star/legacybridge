'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  XCircle,
  Download,
  ChevronDown,
  ChevronRight,
  Terminal,
  Play,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Run, RunEvent } from '@/types';

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-[#4daf73]" />;
  if (status === 'failed') return <XCircle className="w-3.5 h-3.5 text-[#e05252]" />;
  return <RefreshCw className="w-3.5 h-3.5 text-[#8b95ff] animate-spin" />;
}

function RunStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; label: string; pulse?: boolean }> = {
    queued:           { bg: 'bg-white/[0.04] text-[#8a8f98] border-white/[0.08]', label: 'QUEUED' },
    running:          { bg: 'bg-[#8b95ff]/10 text-[#8b95ff] border-[#8b95ff]/30', label: 'RUNNING', pulse: true },
    validating:       { bg: 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30', label: 'VALIDATING', pulse: true },
    delivering:       { bg: 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30', label: 'DELIVERING', pulse: true },
    succeeded:        { bg: 'bg-[#4daf73]/10 text-[#4daf73] border-[#4daf73]/30', label: 'SUCCEEDED' },
    failed:           { bg: 'bg-[#e05252]/10 text-[#e05252] border-[#e05252]/30', label: 'FAILED' },
    validation_failed:{ bg: 'bg-[#e05252]/10 text-[#e05252] border-[#e05252]/30', label: 'VALIDATION FAILED' },
    needs_approval:   { bg: 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30', label: 'NEEDS APPROVAL', pulse: true },
  };
  const c = configs[status] || configs.queued;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold tracking-wider uppercase border ${c.bg}`}>
      {c.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      <span>{c.label}</span>
    </span>
  );
}

export function RunConsole({ runId }: { runId: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);
  const [approvalComments, setApprovalComments] = useState('');
  const [decidingApproval, setDecidingApproval] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const toggleEvent = (id: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${runId}`);
      if (res.ok) {
        const data = await res.json();
        setRun(data);
        if (['succeeded', 'failed', 'validation_failed'].includes(data.status)) {
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

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [run?.events?.length]);

  const handleApprovalDecision = async (decision: 'approved' | 'rejected') => {
    try {
      setDecidingApproval(true);
      const res = await fetch(`/api/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comments: approvalComments }),
      });
      if (res.ok) await fetchRun();
    } catch (e) {
      console.error('Failed to submit approval decision:', e);
    } finally {
      setDecidingApproval(false);
    }
  };

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const res = await fetch(`/api/runs/${runId}/retry`, { method: 'POST' });
      if (res.ok) {
        const newRun = await res.json();
        window.location.href = `/runs/${newRun.id}`;
      }
    } catch (e) {
      console.error('Failed to retry:', e);
    } finally {
      setRetrying(false);
    }
  };

  const handleDownloadResults = () => {
    if (!run?.validatedData) return;
    setDownloading(true);
    const blob = new Blob([JSON.stringify({ runId: run.id, taskId: run.taskId, status: run.status, validatedData: run.validatedData, validationReport: run.validationReport, timestamp: run.completedAt }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacybridge-${run.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 500);
  };

  const handleDownloadCSV = () => {
    if (!run?.validatedData?.items) return;
    const items = run.validatedData.items as Record<string, any>[];
    if (!items.length) return;
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(r => Object.values(r).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacybridge-${run.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !run) {
    return (
      <div className="p-16 text-center text-xs text-[#8a8f98]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8b95ff] mb-3" />
        <p className="text-sm font-medium text-[#f7f8f8]">Connecting to TinyFish Execution Stream...</p>
        <p className="text-xs text-[#5d626b] mt-1">Polling run status every 1.5s</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-[#e05252] mx-auto" />
        <p className="text-sm font-semibold text-[#f7f8f8]">Run not found</p>
        <p className="text-xs text-[#8a8f98]">The run identifier <code className="font-mono">{runId}</code> could not be located.</p>
        <Link href="/runs" className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-[#c7c9cc] hover:bg-white/[0.1] transition">
          ← Back to Runs
        </Link>
      </div>
    );
  }

  const events = run.events || [];
  const duration = run.completedAt
    ? ((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)
    : null;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-5 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Link href="/runs" className="text-[#8a8f98] hover:text-white transition text-xs font-mono">← Runs</Link>
            <span className="text-[#5d626b]">/</span>
            <span className="text-xs font-mono text-[#8b95ff]">{run.id}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RunStatusBadge status={run.status} />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#5d626b] border border-white/[0.06]">
              {run.executionMode === 'demo' ? '🎯 DEMO MODE' : '🔴 LIVE'}
            </span>
            {duration && (
              <span className="text-[10px] font-mono text-[#5d626b]">{duration}s</span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-[#f7f8f8]">Run Console</h1>
          <div className="text-xs text-[#8a8f98] font-mono space-x-3">
            <span>Task: <span className="text-[#c7c9cc]">{run.taskId}</span></span>
            <span>·</span>
            <span>Started: <span className="text-[#c7c9cc]">{new Date(run.startedAt).toLocaleString()}</span></span>
            {run.completedAt && <>
              <span>·</span>
              <span>Completed: <span className="text-[#c7c9cc]">{new Date(run.completedAt).toLocaleString()}</span></span>
            </>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!pollingActive && (
            <button onClick={fetchRun}
              className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition"
              title="Refresh" type="button">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {run.replayUrl && (
            <a href={run.replayUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#8b95ff]/30 bg-[#8b95ff]/10 hover:bg-[#8b95ff]/20 text-[#8b95ff] text-xs font-semibold transition">
              <Video className="w-3.5 h-3.5" /><span>Replay</span>
            </a>
          )}
          {run.validatedData && (
            <>
              <button onClick={handleDownloadResults} disabled={downloading}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] text-xs font-semibold transition"
                type="button">
                <Download className="w-3.5 h-3.5" /><span>JSON</span>
              </button>
              {run.validatedData.items && (
                <button onClick={handleDownloadCSV}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] text-xs font-semibold transition"
                  type="button">
                  <Download className="w-3.5 h-3.5" /><span>CSV</span>
                </button>
              )}
            </>
          )}
          {(run.status === 'failed' || run.status === 'validation_failed') && (
            <button onClick={handleRetry} disabled={retrying}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#e05252]/30 bg-[#e05252]/10 hover:bg-[#e05252]/20 text-[#e05252] text-xs font-semibold transition"
              type="button">
              <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Retrying…' : 'Retry'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Execution Log (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#8b95ff]" />
                <span className="text-sm font-semibold text-[#f7f8f8]">Execution Log</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#5d626b]">{events.length} events</span>
              </div>
              {pollingActive && (
                <div className="flex items-center space-x-2 text-[11px] text-[#8b95ff] font-mono">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Live</span>
                </div>
              )}
            </div>

            <div className="p-3 space-y-1 max-h-[480px] overflow-y-auto font-mono text-xs">
              {events.length === 0 ? (
                <div className="py-8 text-center text-[#5d626b]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8b95ff]" />
                  <p>Waiting for execution events...</p>
                </div>
              ) : (
                events.map(evt => (
                  <div key={evt.id} className="group">
                    <div
                      className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-white/[0.03] cursor-pointer transition-colors"
                      onClick={() => evt.details && toggleEvent(evt.id)}
                    >
                      <StatusIcon status={evt.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${evt.status === 'failed' ? 'text-[#e05252]' : evt.status === 'completed' ? 'text-[#c7c9cc]' : 'text-[#8b95ff]'}`}>
                            {evt.message}
                          </span>
                          <span className="text-[10px] text-[#5d626b] shrink-0 ml-2">
                            {new Date(evt.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#5d626b] mt-0.5">
                          {evt.eventType.replace(/_/g, ' ').toUpperCase()}
                          {evt.details && (
                            <span className="ml-2 text-[#8b95ff] cursor-pointer">
                              {expandedEvents.has(evt.id) ? <ChevronDown className="inline w-3 h-3" /> : <ChevronRight className="inline w-3 h-3" />} details
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedEvents.has(evt.id) && evt.details && (
                      <div className="ml-8 mb-1 p-2.5 rounded-md bg-black/60 border border-white/[0.06] text-[11px] text-[#8a8f98]">
                        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(evt.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* ── Human Approval Panel ── */}
          {run.status === 'needs_approval' && (
            <div className="rounded-xl bg-[#0a0a0a] border border-[#e0a82e]/40 p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <LockKeyhole className="w-5 h-5 text-[#e0a82e] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">Human Approval Required</h3>
                  <p className="text-xs text-[#8a8f98] mt-1">This write action is staged and awaiting operator sign-off. Review the extracted data before authorizing the mutation.</p>
                </div>
              </div>
              <textarea
                value={approvalComments}
                onChange={e => setApprovalComments(e.target.value)}
                placeholder="Add justification or comments for the audit trail (optional)..."
                className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition resize-none h-20"
              />
              <div className="flex items-center space-x-3">
                <button onClick={() => handleApprovalDecision('approved')} disabled={decidingApproval}
                  className="flex-1 py-2.5 rounded-lg bg-[#4daf73] hover:bg-[#5dbf83] text-[#0a0a0a] text-sm font-semibold transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                  type="button">
                  {decidingApproval ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Approve & Deliver</span>
                </button>
                <button onClick={() => handleApprovalDecision('rejected')} disabled={decidingApproval}
                  className="flex-1 py-2.5 rounded-lg bg-[#e05252]/15 hover:bg-[#e05252]/25 text-[#e05252] border border-[#e05252]/30 text-sm font-semibold transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                  type="button">
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Validation Results ── */}
          {run.validationReport && (
            <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#4daf73]" />
                  <span className="text-sm font-semibold text-[#f7f8f8]">Validation Report</span>
                </div>
                <span className={`text-sm font-semibold font-mono ${run.validationReport.score >= 80 ? 'text-[#4daf73]' : 'text-[#e05252]'}`}>
                  {run.validationReport.score}% Trust Score
                </span>
              </div>
              <div className="p-4 space-y-2">
                {run.validationReport.checks.map((chk, i) => (
                  <div key={i} className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    {chk.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4daf73] shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-[#e05252] shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-xs font-medium text-[#f7f8f8]">{chk.name}</p>
                      <p className="text-[11px] text-[#8a8f98] mt-0.5">{chk.detail}</p>
                    </div>
                  </div>
                ))}
                {run.validationReport.anomalies.length > 0 && (
                  <div className="mt-2 p-3 rounded-lg bg-[#e0a82e]/10 border border-[#e0a82e]/30 text-xs text-[#e0a82e]">
                    <AlertTriangle className="inline w-3.5 h-3.5 mr-1.5" />
                    Anomalies: {run.validationReport.anomalies.join('; ')}
                  </div>
                )}
                {run.validationReport.errors.length > 0 && (
                  <div className="mt-2 p-3 rounded-lg bg-[#e05252]/10 border border-[#e05252]/30 text-xs text-[#e05252]">
                    Errors: {run.validationReport.errors.join('; ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Side Panel (1/3) ── */}
        <div className="space-y-4">

          {/* Run Metadata */}
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-[#f7f8f8] uppercase tracking-wider font-mono">Run Metadata</h3>
            {[
              { label: 'Run ID', value: run.id },
              { label: 'Task ID', value: run.taskId },
              { label: 'Mode', value: run.executionMode },
              { label: 'Delivery', value: run.deliveryStatus || 'pending' },
              { label: 'Time Saved', value: `${run.timeSavedMinutes} min` },
              ...(run.tinyfishRunId ? [{ label: 'TinyFish ID', value: run.tinyfishRunId }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-[#5d626b] font-mono shrink-0">{label}</span>
                <span className="text-[#c7c9cc] font-mono text-right truncate">{value}</span>
              </div>
            ))}
            {run.replayUrl && (
              <a href={run.replayUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg border border-[#8b95ff]/20 bg-[#8b95ff]/5 hover:bg-[#8b95ff]/10 text-xs text-[#8b95ff] transition">
                <span className="font-semibold">View TinyFish Replay</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Extracted Data Preview */}
          {run.validatedData && (
            <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#f7f8f8]">Extracted Data</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-[#4daf73]">VALIDATED ✓</span>
                </div>
              </div>
              {Array.isArray(run.validatedData.items) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                      <tr>
                        {Object.keys(run.validatedData.items[0] || {}).map(k => (
                          <th key={k} className="px-3 py-2 text-left text-[#8a8f98] font-medium whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {(run.validatedData.items as Record<string, any>[]).map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          {Object.values(row).map((v: any, j) => (
                            <td key={j} className="px-3 py-2 text-[#c7c9cc] whitespace-nowrap">
                              {typeof v === 'number' ? v.toLocaleString() : String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!Array.isArray(run.validatedData.items) && (
                <div className="p-3">
                  <pre className="text-[11px] font-mono text-[#8a8f98] whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                    {JSON.stringify(run.validatedData, null, 2)}
                  </pre>
                </div>
              )}
              <div className="p-3 border-t border-white/[0.06] flex gap-2">
                <button onClick={handleDownloadResults}
                  className="flex-1 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-[#c7c9cc] transition flex items-center justify-center space-x-1"
                  type="button">
                  <Download className="w-3 h-3" /><span>JSON</span>
                </button>
                {run.validatedData.items && (
                  <button onClick={handleDownloadCSV}
                    className="flex-1 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-[#c7c9cc] transition flex items-center justify-center space-x-1"
                    type="button">
                    <Download className="w-3 h-3" /><span>CSV</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Details */}
          {run.errorMessage && (
            <div className="rounded-xl bg-[#e05252]/10 border border-[#e05252]/30 p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#e05252]" />
                <span className="text-xs font-semibold text-[#e05252]">Execution Error</span>
              </div>
              <p className="text-xs text-[#f7f8f8] font-mono break-words">{run.errorMessage}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            {run.validatedData && (
              <Link href={`/runs/${run.id}/results`}
                className="w-full py-2.5 rounded-lg bg-[#8b95ff] hover:bg-[#b5bcff] text-[#08090a] text-xs font-semibold transition text-center">
                View Full Results →
              </Link>
            )}
            <Link href="/runs" className="w-full py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-[#c7c9cc] transition text-center">
              ← All Runs
            </Link>
            <Link href="/history" className="w-full py-2 rounded-lg border border-white/[0.06] bg-transparent text-xs text-[#5d626b] hover:text-[#8a8f98] transition text-center font-mono">
              Audit Trail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
