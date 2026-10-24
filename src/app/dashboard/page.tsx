'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers3,
  FileCode2,
  ShieldCheck,
  Zap,
  Database,
  Radio,
  Workflow,
  GitCompare,
  FileText,
  Sparkles,
  Server,
  Terminal,
  AlertCircle,
  ArrowRight,
  Activity,
  Eye,
  Download,
  BarChart3,
  Shield,
  Search,
  Code2,
  BookOpen,
  Network,
  LockKeyhole,
  Check,
} from 'lucide-react';
import { Task, Run } from '@/types';

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    succeeded: 'bg-[#4daf73]/10 text-[#4daf73] border-[#4daf73]/30',
    failed: 'bg-[#e05252]/10 text-[#e05252] border-[#e05252]/30',
    validation_failed: 'bg-[#e05252]/10 text-[#e05252] border-[#e05252]/30',
    running: 'bg-[#8b95ff]/10 text-[#8b95ff] border-[#8b95ff]/30',
    validating: 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30',
    delivering: 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30',
    needs_approval: 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30',
    queued: 'bg-white/[0.04] text-[#8a8f98] border-white/[0.08]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider uppercase border ${map[status] || 'bg-white/[0.04] text-[#8a8f98] border-white/[0.08]'}`}>
      {status === 'running' || status === 'validating' || status === 'delivering' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1" />
      ) : null}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const QUICK_LINKS = [
  { label: 'New Task', href: '/tasks/new', icon: Plus, color: 'text-[#f7f8f8]', bg: 'bg-[#f7f8f8] text-[#08090a]', primary: true },
  { label: 'Task Library', href: '/tasks', icon: Layers3, color: 'text-[#8b95ff]', bg: 'bg-[#8b95ff]/10 border-[#8b95ff]/20 border' },
  { label: 'Run Consoles', href: '/runs', icon: Radio, color: 'text-[#4daf73]', bg: 'bg-[#4daf73]/10 border-[#4daf73]/20 border' },
  { label: 'Audit Trail', href: '/history', icon: FileText, color: 'text-[#e0a82e]', bg: 'bg-[#e0a82e]/10 border-[#e0a82e]/20 border' },
  { label: 'Reports', href: '/reports', icon: BarChart3, color: 'text-[#8b95ff]', bg: 'bg-white/[0.04] border border-white/[0.08]' },
  { label: 'Vault', href: '/settings', icon: LockKeyhole, color: 'text-[#8a8f98]', bg: 'bg-white/[0.04] border border-white/[0.08]' },
];

const PLATFORM_MODULES = [
  { label: 'Code Analysis', href: '/analysis', icon: Code2, desc: 'AST parsing & module metrics', status: 'live' },
  { label: 'Business Logic', href: '/business-logic', icon: BookOpen, desc: 'Extracted rules & invariants', status: 'live' },
  { label: 'Dep Graph', href: '/architecture', icon: Network, desc: 'Visual coupling map', status: 'live' },
  { label: 'Migration Plan', href: '/migration', icon: Workflow, desc: 'Strangler fig roadmap', status: 'live' },
  { label: 'Safety Twin', href: '/safety-twin', icon: GitCompare, desc: 'Parity comparison engine', badge: 'TWIN', status: 'alert' },
  { label: 'Drift Detector', href: '/drift', icon: AlertTriangle, desc: 'Logic regression testing', badge: 'DRIFT', status: 'alert' },
  { label: 'Confidence Gate', href: '/confidence-gate', icon: Shield, desc: 'Migration readiness gate', status: 'live' },
  { label: 'Continuous Guard', href: '/continuous-guard', icon: ShieldCheck, desc: 'Real-time behavioral guard', status: 'live' },
  { label: 'AI Advisor', href: '/advisor', icon: Sparkles, desc: 'Boundary recommendations', status: 'live' },
  { label: 'Research', href: '/research', icon: Search, desc: 'TinyFish doc exploration', badge: 'TF', status: 'live' },
  { label: 'Security', href: '/security', icon: Shield, desc: 'OWASP findings & posture', status: 'live' },
  { label: 'Reports', href: '/reports', icon: FileText, desc: 'Executive audit exports', status: 'live' },
];

// Interactive drift test state
const initialDriftState = {
  tested: true,
  qty: 5,
  stock: 2,
  monolithOutcome: 'Order rejected',
  modernOutcome: 'Order confirmed',
  status: 'FAIL: needs human review' as 'FAIL: needs human review' | 'PASSED',
  isFixed: false,
  reason: 'Edge case handled in monolith was simplified or lost in the new service.',
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  // Drift test
  const [driftState, setDriftState] = useState(initialDriftState);
  const [executingDrift, setExecutingDrift] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(5);

  // Dashboard stats
  const totalRuns = runs.length;
  const succeededRuns = runs.filter(r => r.status === 'succeeded').length;
  const failedRuns = runs.filter(r => r.status === 'failed' || r.status === 'validation_failed').length;
  const activeRuns = runs.filter(r => ['running', 'validating', 'delivering'].includes(r.status)).length;
  const pendingApproval = runs.filter(r => r.status === 'needs_approval').length;
  const totalMinutesSaved = runs.filter(r => r.status === 'succeeded').reduce((acc, r) => acc + (r.timeSavedMinutes || 120), 0);
  const totalHoursSaved = (totalMinutesSaved / 60).toFixed(1);
  const estimatedSavings = (Number(totalHoursSaved) * 38.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const successRate = totalRuns > 0 ? ((succeededRuns / totalRuns) * 100).toFixed(0) : null;

  const recentRuns = runs.slice(0, 6);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resTasks, resRuns] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()).catch(() => []),
        fetch('/api/runs').then(r => r.json()).catch(() => []),
      ]);
      setTasks(Array.isArray(resTasks) ? resTasks : []);
      setRuns(Array.isArray(resRuns) ? resRuns : []);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 8s if there are active runs
    const interval = setInterval(() => {
      if (activeRuns > 0) fetchData();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData, activeRuns]);

  const handleRunTask = async (taskId: string) => {
    try {
      setRunningTaskId(taskId);
      const res = await fetch(`/api/tasks/${taskId}/run`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to start run');
        setRunningTaskId(null);
        return;
      }
      const newRun = await res.json();
      router.push(`/runs/${newRun.id}`);
    } catch (e) {
      console.error('Failed to trigger run:', e);
      setRunningTaskId(null);
    }
  };

  const handleExecuteDrift = (fixedMode: boolean = false) => {
    setExecutingDrift(true);
    setTimeout(() => {
      const { qty, stock } = driftState;
      const monolithOutcome = stock < qty ? 'Order rejected' : 'Order confirmed';
      const modernOutcome = fixedMode ? monolithOutcome : 'Order confirmed';
      const isPassing = monolithOutcome === modernOutcome;
      setDriftState(prev => ({
        ...prev,
        monolithOutcome,
        modernOutcome,
        status: isPassing ? 'PASSED' : 'FAIL: needs human review',
        isFixed: fixedMode,
        reason: isPassing
          ? 'Business rule parity verified. Edge case preserved in modern microservice.'
          : 'Edge case lost. Stock deficit was not blocked in new service.',
      }));
      setExecutingDrift(false);
    }, 500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73] shadow-[0_0_6px_rgba(77,175,115,0.6)]" />
            <span>LEGACYBRIDGE OPERATIONS CENTER · v2.4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Operations &amp; Intelligence Dashboard
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            AI-powered legacy web automation with validated delivery, drift detection, and safe migration planning.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition shadow-sm"
            title="Refresh Dashboard"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b95ff]' : ''}`} />
          </button>
          <Link
            href="/drift"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#e05252]/15 border border-[#e05252]/30 hover:bg-[#e05252]/25 text-[#f7f8f8] font-semibold text-xs tracking-tight transition"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#e05252]" />
            <span>Drift Suite</span>
          </Link>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs tracking-tight transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Tasks', value: tasks.length, icon: FileCode2, color: 'text-[#8b95ff]', sub: 'configured' },
          { label: 'Total Runs', value: totalRuns, icon: Radio, color: 'text-[#4daf73]', sub: 'all time' },
          { label: 'Succeeded', value: succeededRuns, icon: CheckCircle2, color: 'text-[#4daf73]', sub: successRate ? `${successRate}% rate` : '' },
          { label: 'Active', value: activeRuns, icon: Activity, color: 'text-[#8b95ff]', sub: activeRuns > 0 ? 'live' : 'idle', pulse: activeRuns > 0 },
          { label: 'Approval', value: pendingApproval, icon: Clock, color: 'text-[#e0a82e]', sub: 'awaiting sign-off' },
          { label: 'Hours Saved', value: totalHoursSaved, icon: Zap, color: 'text-[#e0a82e]', sub: `$${estimatedSavings} value` },
        ].map(({ label, value, icon: Icon, color, sub, pulse }) => (
          <div key={label} className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-4 hover:border-white/[0.18] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8a8f98] uppercase tracking-wider">{label}</span>
              <div className={`w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${color}`}>
                <Icon className={`w-3 h-3 ${pulse ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#f7f8f8] tracking-tight">{value}</div>
            {sub && <div className="mt-0.5 text-[10px] text-[#5d626b]">{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Pending Approval Alert ── */}
      {pendingApproval > 0 && (
        <div className="rounded-xl bg-[#e0a82e]/10 border border-[#e0a82e]/30 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-[#e0a82e] animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#f7f8f8]">{pendingApproval} write action{pendingApproval > 1 ? 's' : ''} awaiting human approval</p>
              <p className="text-xs text-[#8a8f98]">Review before this mutation is dispatched to the destination.</p>
            </div>
          </div>
          <Link href="/runs" className="px-3 py-1.5 rounded-lg bg-[#e0a82e] text-[#08090a] text-xs font-semibold transition hover:bg-[#f5c842]">
            Review Now →
          </Link>
        </div>
      )}

      {/* ── Quick Launch Grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {QUICK_LINKS.map(({ label, href, icon: Icon, bg, primary }) => (
          <Link key={href} href={href}
            className={`rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] ${primary ? bg + ' shadow-md' : bg + ' hover:border-white/[0.25]'}`}
          >
            <Icon className={`w-4 h-4 ${primary ? 'text-[#08090a]' : ''}`} />
            <span className={`text-[10px] font-semibold ${primary ? 'text-[#08090a]' : 'text-[#c7c9cc]'}`}>{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Recent Runs (2/3 width) ── */}
        <div className="lg:col-span-2 rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#f7f8f8]">Recent Execution Runs</h2>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">Live-updating browser automation pipeline</p>
            </div>
            <Link href="/runs" className="text-[11px] text-[#8b95ff] hover:underline font-mono">
              All runs →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#8a8f98]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8b95ff]" />
              Loading runs...
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Radio className="w-8 h-8 text-[#5d626b] mx-auto" />
              <p className="text-sm font-semibold text-[#f7f8f8]">No runs yet</p>
              <p className="text-xs text-[#8a8f98]">Execute a task from the Task Library to see live telemetry here.</p>
              <Link href="/tasks/new" className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-[#c7c9cc] hover:bg-white/[0.1] transition">
                <Plus className="w-3.5 h-3.5" /><span>Create First Task</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentRuns.map(r => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors group">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono text-[#8b95ff] truncate max-w-[160px]">{r.id}</span>
                      <StatusPill status={r.status} />
                      {r.executionMode === 'demo' && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#5d626b] border border-white/[0.06]">demo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#5d626b] font-mono truncate">
                      {r.taskId} · {new Date(r.startedAt).toLocaleTimeString()} · {r.deliveryStatus || 'pending'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {r.validationReport && (
                      <span className={`text-[10px] font-mono font-semibold ${r.validationReport.score >= 80 ? 'text-[#4daf73]' : 'text-[#e05252]'}`}>
                        {r.validationReport.score}%
                      </span>
                    )}
                    <Link href={`/runs/${r.id}`}
                      className="px-2.5 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[11px] font-medium text-[#c7c9cc] transition opacity-0 group-hover:opacity-100"
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Task Library Summary (1/3 width) ── */}
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#f7f8f8]">Task Library</h2>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">{tasks.length} configured pipeline{tasks.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/tasks" className="text-[11px] text-[#8b95ff] hover:underline font-mono">Manage →</Link>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-[#8a8f98]">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-[#8b95ff]" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <Layers3 className="w-6 h-6 text-[#5d626b] mx-auto" />
              <p className="text-xs text-[#8a8f98]">No tasks yet</p>
              <Link href="/tasks/new" className="text-xs text-[#8b95ff] hover:underline">Create first task →</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="px-4 py-3 space-y-1.5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#f7f8f8] line-clamp-1 group-hover:text-[#8b95ff] transition-colors">{task.name}</p>
                    <span className={`shrink-0 text-[8px] font-mono px-1.5 py-0.5 rounded border ${task.isWriteAction ? 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30' : 'bg-[#5e6ad2]/10 text-[#8b95ff] border-[#5e6ad2]/30'}`}>
                      {task.isWriteAction ? 'GATE' : 'READ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5d626b] line-clamp-1">{task.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#5d626b]">{task.destinationType}</span>
                    <button
                      onClick={() => handleRunTask(task.id)}
                      disabled={runningTaskId === task.id}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] font-semibold text-[#c7c9cc] transition active:scale-95 disabled:opacity-50"
                      type="button"
                    >
                      {runningTaskId === task.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{runningTaskId === task.id ? 'Starting…' : 'Run'}</span>
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-3 text-center">
                <Link href="/tasks/new" className="inline-flex items-center space-x-1 text-[11px] text-[#8b95ff] hover:underline">
                  <Plus className="w-3 h-3" /><span>New Task</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Core Workflow Pipeline ── */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#8b95ff] uppercase tracking-wider">END-TO-END PIPELINE</div>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mt-1">Core Modernization Workflow</h2>
          </div>
          <span className="text-xs text-[#8a8f98] font-mono">
            Active: <strong className={activeWorkflowStep === 5 ? 'text-[#e05252]' : 'text-[#4daf73]'}>
              {['', 'DISCOVER', 'UNDERSTAND', 'PLAN', 'GENERATE', 'VALIDATE'][activeWorkflowStep]}
            </strong>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: 1, label: 'DISCOVER', title: 'Codebase Scan', desc: 'AST parsing, dependency mapping & data flow.', href: '/architecture', link: 'AST Graph', color: '#4daf73', done: true },
            { step: 2, label: 'UNDERSTAND', title: 'Logic Extraction', desc: 'Extract business rules & document implicit logic.', href: '/business-logic', link: 'Rules', color: '#4daf73', done: true },
            { step: 3, label: 'PLAN', title: 'Strangler Roadmap', desc: 'Define bounded contexts & service boundaries.', href: '/migration', link: 'Plan', color: '#8b95ff', gate: true },
            { step: 4, label: 'GENERATE', title: 'Microservice Scaffold', desc: 'Generate FastAPI/Node scaffolds, OpenAPI & tests.', href: '/migration', link: 'Scaffolds', color: '#8b95ff', gate: true },
            { step: 5, label: 'VALIDATE', title: 'Drift Regression', desc: 'Parity testing catches logic drift before deploy.', href: '/drift', link: 'Review', color: '#e05252', alert: true },
          ].map(({ step, label, title, desc, href, link, color, done, gate, alert }) => (
            <div
              key={step}
              onClick={() => setActiveWorkflowStep(step)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${activeWorkflowStep === step
                ? alert
                  ? 'bg-white/[0.07] border-[#e05252] shadow-[0_0_15px_rgba(224,82,82,0.2)]'
                  : 'bg-white/[0.07] border-[#8b95ff] shadow-[0_0_15px_rgba(139,149,255,0.15)]'
                : alert
                  ? 'bg-white/[0.02] border-[#e05252]/40 hover:border-[#e05252]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold" style={{ color }}>{step}. {label}</span>
                {done ? <CheckCircle2 className="w-4 h-4" style={{ color }} /> :
                  gate ? <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8b95ff]/15 text-[#8b95ff] border border-[#8b95ff]/30">Gate</span> :
                    <AlertTriangle className="w-4 h-4 text-[#e05252] animate-pulse" />}
              </div>
              <h4 className="text-sm font-semibold text-[#f7f8f8]">{title}</h4>
              <p className="text-[11px] text-[#8a8f98] mt-1">{desc}</p>
              <div className="mt-3 flex justify-end text-[10px] font-mono">
                <Link href={href} className="hover:underline" style={{ color }} onClick={e => e.stopPropagation()}>
                  {link} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Logic Drift Interactive Playground ── */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#e05252]/30 p-6 relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#e05252]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#e05252]/15 border border-[#e05252]/30 text-[#e05252] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" /><span>FLAGSHIP: LOGIC DRIFT REGRESSION TEST</span>
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8]">Business Rule Parity Check</h2>
            <p className="text-xs text-[#8a8f98] mt-1">Catches logic lost in migration — before it reaches production.</p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase border ${driftState.status === 'FAIL: needs human review'
            ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
            : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'}`}>
            {driftState.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-black/60 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8a8f98]">ORIGINAL RULE (MONOLITH)</span>
              <span className="text-[#4daf73]">orders_monolith.js:L146</span>
            </div>
            <pre className="p-3 rounded bg-black/80 text-[12px] font-mono text-[#c7c9cc] overflow-x-auto border border-white/[0.04]">
              <code>{`if (stock < qty) {\n  return reject("INSUFFICIENT_STOCK");\n}\nconfirmOrder(order);`}</code>
            </pre>
            <div className="text-[11px] text-[#5d626b]">Strictly rejects when available stock is below requested quantity.</div>
          </div>

          <div className={`p-4 rounded-lg bg-black/60 border space-y-2 ${driftState.isFixed ? 'border-[#4daf73]/30' : 'border-[#e05252]/30'}`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={driftState.isFixed ? 'text-[#4daf73]' : 'text-[#e05252]'}>PROPOSED RULE (NEW SERVICE)</span>
              <span className={driftState.isFixed ? 'text-[#4daf73]' : 'text-[#e05252]'}>
                {driftState.isFixed ? 'fulfillment.js (FIXED)' : 'fulfillment.js:L118 (DRIFT)'}
              </span>
            </div>
            <pre className="p-3 rounded bg-black/80 text-[12px] font-mono text-[#c7c9cc] overflow-x-auto border border-white/[0.04]">
              <code>{driftState.isFixed
                ? `if (stock < qty) {\n  return reject("INSUFFICIENT_STOCK"); // RESTORED\n}\nconfirmOrder(order);`
                : `if (stock < qty) {\n  log.warn("low stock"); // BUG: Non-blocking!\n}\nconfirmOrder(order);`}</code>
            </pre>
            <div className={`text-[11px] ${driftState.isFixed ? 'text-[#4daf73]' : 'text-[#e05252]'}`}>
              {driftState.isFixed ? 'Hard rejection restored. Parity achieved.' : 'Edge case lost! Orders confirm despite insufficient inventory.'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-[#8a8f98]">TEST PAYLOAD:</span>
            <label className="flex items-center space-x-2">
              <span className="text-[#5d626b]">qty:</span>
              <input type="number" value={driftState.qty}
                onChange={e => setDriftState(prev => ({ ...prev, qty: Number(e.target.value) }))}
                className="w-16 px-2 py-1 rounded bg-black border border-white/[0.12] text-white text-center font-mono focus:border-[#8b95ff] outline-none text-xs" />
            </label>
            <label className="flex items-center space-x-2">
              <span className="text-[#5d626b]">stock:</span>
              <input type="number" value={driftState.stock}
                onChange={e => setDriftState(prev => ({ ...prev, stock: Number(e.target.value) }))}
                className="w-16 px-2 py-1 rounded bg-black border border-white/[0.12] text-white text-center font-mono focus:border-[#8b95ff] outline-none text-xs" />
            </label>
            <span>Expected: <strong className="text-[#f7f8f8]">{driftState.monolithOutcome}</strong></span>
            <span>·</span>
            <span>Got: <strong className={driftState.status.includes('FAIL') ? 'text-[#e05252]' : 'text-[#4daf73]'}>{driftState.modernOutcome}</strong></span>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {driftState.status.includes('FAIL') ? (
              <button onClick={() => handleExecuteDrift(true)} disabled={executingDrift}
                className="px-3 py-1.5 rounded-lg bg-[#4daf73]/20 hover:bg-[#4daf73]/30 text-[#4daf73] border border-[#4daf73]/30 text-xs font-semibold transition"
                type="button">Auto-Fix Parity</button>
            ) : (
              <button onClick={() => handleExecuteDrift(false)} disabled={executingDrift}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8a8f98] text-xs font-mono transition"
                type="button">Inject Drift</button>
            )}
            <button onClick={() => handleExecuteDrift(driftState.isFixed)} disabled={executingDrift}
              className="px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-1.5 active:scale-95"
              type="button">
              {executingDrift
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Executing…</span></>
                : <><Play className="w-3.5 h-3.5 fill-current" /><span>Execute Test</span></>}
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#e05252]/10 border border-[#e05252]/20 flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-[#e05252] shrink-0 mt-0.5" />
          <p className="text-xs text-[#f7f8f8] leading-relaxed">
            <strong className="text-[#e05252]">Drift detected.</strong> {driftState.reason}
          </p>
        </div>
      </div>

      {/* ── Platform Modules ── */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#f7f8f8]">Platform Intelligence Modules</h2>
            <p className="text-xs text-[#8a8f98] mt-1">All 12 modules operational. Click any module to open its console.</p>
          </div>
          <span className="text-xs font-mono text-[#4daf73] bg-[#4daf73]/10 border border-[#4daf73]/30 px-2.5 py-1 rounded">
            12 / 12 LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PLATFORM_MODULES.map(({ label, href, icon: Icon, desc, badge, status }) => (
            <Link key={href + label} href={href}
              className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition-all group flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 text-[#5d626b] group-hover:text-[#8b95ff] transition-colors" />
                {badge ? (
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${status === 'alert' ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30' : 'bg-[#5e6ad2]/15 text-[#8b95ff] border-[#5e6ad2]/30'}`}>
                    {badge}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#8b95ff] transition-colors">{label}</h4>
                <p className="text-[10px] text-[#5d626b] mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bounded Contexts / Microservices Overview ── */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#f7f8f8]">Monolith → Bounded Context Extraction</h2>
            <p className="text-xs text-[#8a8f98] mt-1">Acme ERP decomposition: 4 autonomous domain services</p>
          </div>
          <Link href="/architecture" className="text-xs text-[#8b95ff] hover:underline font-mono">Full Canvas →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: 1, name: 'Customer Service', desc: 'Profiles, credit underwriting, tier evaluation', ep: '/api/v1/credit', db: 'Customer DB', status: 'Extracted', color: '#4daf73' },
            { num: 2, name: 'Order Service', desc: 'Sales orders intake, lifecycle orchestration', ep: '/api/v1/orders', db: 'Order DB', status: 'In Migration', color: '#e0a82e' },
            { num: 3, name: 'Inventory Service', desc: 'Multi-warehouse stock balances, reservations', ep: '/api/v1/inventory', db: 'Inventory DB', status: 'Extracted', color: '#4daf73' },
            { num: 4, name: 'Payment Service', desc: 'Gateway settlement, ledger entries, PCI boundary', ep: '/api/v1/payments', db: 'Payment DB', status: 'Planned', color: '#8a8f98' },
          ].map(({ num, name, desc, ep, db, status, color }) => (
            <div key={num} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#8b95ff] uppercase">Service {num}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border" style={{ color, backgroundColor: `${color}22`, borderColor: `${color}55` }}>
                    {status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#f7f8f8]">{name}</h3>
                <p className="text-xs text-[#8a8f98] mt-1">{desc}</p>
              </div>
              <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#5d626b] space-y-1">
                <div>DB: <strong className="text-[#c7c9cc]">{db}</strong></div>
                <div>Endpoint: <code className="text-[#8b95ff]">{ep}</code></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
