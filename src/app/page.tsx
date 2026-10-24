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
  FileCode2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Task, Run } from '@/types';

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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal tracking-wider uppercase mb-1">
            Enterprise Automation Suite
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            &ldquo;Describe the task. Keep the old system.&rdquo; Active TinyFish web browser agent pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-teal text-white hover:bg-teal-700 font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface rounded-card p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Automated Tasks</span>
            <FileCode2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-ink">{tasks.length}</div>
          <div className="mt-1 text-xs text-slate-500">Configured extraction pipes</div>
        </div>

        <div className="bg-surface rounded-card p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Successful Runs</span>
            <CheckCircle2 className="w-4 h-4 text-teal" />
          </div>
          <div className="mt-3 text-2xl font-bold text-ink">
            {succeededRuns}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-mono">/ {totalRuns}</span>
          </div>
          <div className="mt-1 text-xs text-teal font-medium">
            {totalRuns > 0 ? `${((succeededRuns / totalRuns) * 100).toFixed(0)}% completion rate` : 'No runs yet'}
          </div>
        </div>

        <div className="bg-surface rounded-card p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Manual Time Saved</span>
            <Clock className="w-4 h-4 text-amber-dark" />
          </div>
          <div className="mt-3 text-2xl font-bold text-ink">{totalHoursSaved} hrs</div>
          <div className="mt-1 text-xs text-slate-500">vs 2.0 hrs manual ERP entry avg</div>
        </div>

        <div className="bg-surface rounded-card p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Enterprise ROI</span>
            <DollarSign className="w-4 h-4 text-teal" />
          </div>
          <div className="mt-3 text-2xl font-bold text-ink">${estimatedSavings}</div>
          <div className="mt-1 text-xs text-slate-500">Calculated at $38.50/hr ops rate</div>
        </div>
      </div>

      {/* Hero Task Execution Card */}
      {tasks.length > 0 && (
        <div className="bg-navy-900 text-white rounded-card p-6 border border-navy-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-teal/30 text-mint border border-teal/50">
              FEATURED TASK
            </div>
            <h2 className="text-xl font-serif font-bold text-white">{tasks[0].name}</h2>
            <p className="text-sm text-slate-300 max-w-2xl font-sans">{tasks[0].prompt}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Target: <code className="text-slate-200 font-mono">{tasks[0].sourceUrl}</code></span>
              <span>·</span>
              <span>Destination: <span className="text-slate-200 font-semibold">{tasks[0].destinationType.toUpperCase()}</span></span>
              <span>·</span>
              <span>Schedule: <span className="text-slate-200">{tasks[0].scheduleHuman || 'Manual trigger'}</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`/api/feeds/${tasks[0].id}/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-lg border border-slate-700 bg-navy-800 hover:bg-navy-700 text-slate-200 text-sm font-medium transition inline-flex items-center space-x-1.5"
            >
              <span>View API Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => handleRunTask(tasks[0].id)}
              disabled={runningTaskId === tasks[0].id}
              className="px-5 py-2.5 rounded-lg bg-teal hover:bg-teal-700 text-white text-sm font-semibold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {runningTaskId === tasks[0].id ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Launching Agent...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Task Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Executions & Tasks Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Executions */}
        <div className="lg:col-span-2 bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-ink">Recent Executions</h3>
            <Link href="/history" className="text-xs text-teal font-medium hover:underline flex items-center space-x-1">
              <span>View All Audit History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading execution history...</div>
          ) : runs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600 font-medium">No task runs executed yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Trigger your first automated run from the task builder to view real execution timelines.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden">
              {runs.slice(0, 5).map((run) => (
                <div key={run.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          run.status === 'succeeded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : run.status === 'failed' || run.status === 'validation_failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-dark border border-amber/40'
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{run.id}</span>
                      <span className="text-xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {run.executionMode === 'demo' ? 'DEMO FIXTURE' : 'REAL AGENT'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Started {new Date(run.startedAt).toLocaleTimeString()} · Delivery: {run.deliveryStatus || 'pending'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/runs/${run.id}`}
                      className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 hover:bg-white text-slate-700 transition"
                    >
                      Console
                    </Link>
                    {run.validatedData && (
                      <Link
                        href={`/runs/${run.id}/results`}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-teal text-white hover:bg-teal-700 transition"
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

        {/* Right: Validation & Health Status */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-4">
            <h3 className="font-serif font-bold text-lg text-ink">System Trust Engine</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900">VALIDATE Pillar Active</div>
                  <div className="text-emerald-800/80 mt-0.5">
                    Strict Pydantic JSON schema invariants and null checks applied to every extraction.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-blue-50/60 border border-blue-200/60">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900">APPROVE Gate Enforced</div>
                  <div className="text-blue-800/80 mt-0.5">
                    Read extractions stream automatically; write modifications require human operator approval.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-amber-50/60 border border-amber/40">
                <AlertTriangle className="w-4 h-4 text-amber-dark shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-dark">AUDIT Trail Replay</div>
                  <div className="text-amber-dark/80 mt-0.5">
                    Live TinyFish cloud browser replay URLs and delivery hashes stored immutably.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
