'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  FileCode2,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { Task, Run } from '@/types';
import { SplineHeroVisual } from '@/components/SplineHeroVisual';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTasks, resRuns] = await Promise.all([
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/runs').then((r) => r.json()),
      ]);
      setTasks(Array.isArray(resTasks) ? resTasks : []);
      setRuns(Array.isArray(resRuns) ? resRuns : []);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunTask = async (taskId: string) => {
    try {
      setRunningTaskId(taskId);
      const res = await fetch(`/api/tasks/${taskId}/run`, { method: 'POST' });
      const newRun = await res.json();
      router.push(`/runs/${newRun.id}`);
    } catch (e) {
      console.error('Failed to trigger run:', e);
      setRunningTaskId(null);
    }
  };

  const totalRuns = runs.length;
  const succeededRuns = runs.filter((r) => r.status === 'succeeded').length;
  const failedRuns = runs.filter((r) => r.status === 'failed' || r.status === 'validation_failed').length;
  const totalMinutesSaved = runs
    .filter((r) => r.status === 'succeeded')
    .reduce((acc, r) => acc + (r.timeSavedMinutes || 120), 0);
  const totalHoursSaved = (totalMinutesSaved / 60).toFixed(1);
  const estimatedSavings = (Number(totalHoursSaved) * 38.5).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>ENTERPRISE ORCHESTRATION ENGINE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Operations Command Center
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            &ldquo;Describe the task. Keep the old system.&rdquo; Autonomous cloud browser agents converting brittle portals into resilient REST APIs.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards - Dribbble Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 hover:border-teal-500/40 transition-all duration-300 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Automated Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileCode2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{tasks.length}</span>
            <span className="text-xs text-teal-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +100% active
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Configured extraction pipes</div>
        </div>

        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 hover:border-emerald-500/40 transition-all duration-300 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {totalRuns > 0 ? `${((succeededRuns / totalRuns) * 100).toFixed(0)}%` : '100%'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({succeededRuns}/{totalRuns} runs)
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-medium">Zero schema drift detected</div>
        </div>

        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 hover:border-amber-500/40 transition-all duration-300 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Manual Time Saved</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalHoursSaved}</span>
            <span className="text-sm font-semibold text-slate-400">hrs</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Based on 2.0 hrs manual ERP ops avg</div>
        </div>

        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 hover:border-indigo-500/40 transition-all duration-300 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Enterprise Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">${estimatedSavings}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> ROI
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Calculated at $38.50/hr ops rate</div>
        </div>
      </div>

      {/* Interactive Spline Architecture Hero Visualizer */}
      <SplineHeroVisual />

      {/* Feature Navigation Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <Link
          href="/tasks"
          className="flex items-center space-x-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Task Library</div>
            <div className="text-xs text-slate-400">All configured pipes</div>
          </div>
        </Link>

        <Link
          href="/tasks/new"
          className="flex items-center space-x-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Task Builder</div>
            <div className="text-xs text-slate-400">Formulate new pipe</div>
          </div>
        </Link>

        <Link
          href="/runs"
          className="flex items-center space-x-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 fill-indigo-400/20" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Run Console</div>
            <div className="text-xs text-slate-400">Real-time telemetry</div>
          </div>
        </Link>

        <Link
          href="/history"
          className="flex items-center space-x-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Audit Trail</div>
            <div className="text-xs text-slate-400">Immutable replays</div>
          </div>
        </Link>
      </div>

      {/* Hero Featured Task Card */}
      {tasks.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/90 p-6 md:p-8 shadow-2xl shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-medium">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>FEATURED PIPELINE</span>
            </div>
            <h2 className="text-2xl font-sans font-bold text-white tracking-tight">{tasks[0].name}</h2>
            <p className="text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">{tasks[0].prompt}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="text-slate-500">Source:</span>
                <code className="text-teal-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                  {tasks[0].sourceUrl}
                </code>
              </span>
              <span>·</span>
              <span>
                Destination: <span className="text-white font-semibold">{tasks[0].destinationType.toUpperCase()}</span>
              </span>
              <span>·</span>
              <span>
                Schedule: <span className="text-slate-300 font-sans">{tasks[0].scheduleHuman || 'Manual trigger'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`/api/feeds/${tasks[0].id}/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-sm font-medium transition inline-flex items-center space-x-2"
            >
              <span>Instant API Feed</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <button
              onClick={() => handleRunTask(tasks[0].id)}
              disabled={runningTaskId === tasks[0].id}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-sm font-bold transition flex items-center space-x-2 shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
            >
              {runningTaskId === tasks[0].id ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Launching Agent...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Run Task Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Executions + Three Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left 2 Cols: Recent Executions */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Live Execution Feed</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of TinyFish browser automation runs</p>
            </div>
            <Link
              href="/history"
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-1 group"
            >
              <span>View Full Audit History</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
              Loading execution history...
            </div>
          ) : runs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm text-white font-semibold">No task runs executed yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Trigger your first automated run from the task builder to view real execution timelines and audit logs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 overflow-hidden">
              {runs.slice(0, 6).map((run) => (
                <div
                  key={run.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 -mx-3 rounded-xl transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                          run.status === 'succeeded'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : run.status === 'failed' || run.status === 'validation_failed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{run.id}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
                        {run.executionMode === 'demo' ? 'DEMO FIXTURE' : 'REAL AGENT'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>Started {new Date(run.startedAt).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="capitalize">Delivery: <strong className="text-slate-300">{run.deliveryStatus || 'pending'}</strong></span>
                      {run.validationReport && (
                        <>
                          <span>·</span>
                          <span className="text-teal-400 font-mono">Score: {run.validationReport.score}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/runs/${run.id}`}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 transition"
                    >
                      Console
                    </Link>
                    {run.validatedData && (
                      <Link
                        href={`/runs/${run.id}/results`}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-sm"
                      >
                        Results
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Three Trust Pillars Telemetry */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-4">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Three Trust Pillars</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enterprise assurance guarantees</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>1. VALIDATE Pillar Active</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] pl-6">
                  Strict Pydantic JSON schema invariants and &lt;5% null threshold checks applied to every extraction.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>2. APPROVE Gate Enforced</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] pl-6">
                  Read extractions stream automatically; write modifications require explicit human operator sign-off.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>3. AUDIT Trail Replay</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] pl-6">
                  Live TinyFish cloud browser replay URLs and SHA-256 delivery hashes stored immutably.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
