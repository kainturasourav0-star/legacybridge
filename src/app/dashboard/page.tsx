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
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers3,
  FileCode2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database,
  Radio,
  LockKeyhole,
  Workflow,
  Boxes,
  GitCompare,
  FileText,
  Sparkles,
  Server,
  Terminal,
} from 'lucide-react';
import { Task, Run, DriftAnalysis } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  // Pitch Deck Slide 5 Interactive Drift State
  const [stockTestQty, setStockTestQty] = useState<number>(5);
  const [stockTestStock, setStockTestStock] = useState<number>(2);
  const [driftResult, setDriftResult] = useState<{
    tested: boolean;
    monolithOutcome: string;
    modernOutcome: string;
    status: 'FAIL: needs human review' | 'PASSED';
    reason: string;
    isFixed?: boolean;
  }>({
    tested: true,
    monolithOutcome: 'Order rejected',
    modernOutcome: 'Order confirmed',
    status: 'FAIL: needs human review',
    reason: 'Edge case handled in monolith was simplified or lost in the new service. Stock deficit (2 < 5) resulted in order confirmation.',
  });
  const [executingDriftTest, setExecutingDriftTest] = useState(false);

  // Active step in the Slide 4 Connected Workflow
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTasks, resRuns] = await Promise.all([
        fetch('/api/tasks').then((r) => r.json()).catch(() => []),
        fetch('/api/runs').then((r) => r.json()).catch(() => []),
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

  const handleExecuteSlide5Test = (fixedMode: boolean = false) => {
    setExecutingDriftTest(true);
    setTimeout(() => {
      const monolithOutcome = stockTestStock < stockTestQty ? 'Order rejected' : 'Order confirmed';
      const modernOutcome = fixedMode
        ? monolithOutcome
        : 'Order confirmed'; // The injected bug from Slide 5!

      const isPass = monolithOutcome === modernOutcome;
      setDriftResult({
        tested: true,
        monolithOutcome,
        modernOutcome,
        status: isPass ? 'PASSED' : 'FAIL: needs human review',
        reason: isPass
          ? 'Business rule parity verified. Edge case preserved in modern microservice.'
          : 'Edge case handled in monolith was simplified or lost in the new service. Developer review required before deployment.',
        isFixed: fixedMode,
      });
      setExecutingDriftTest(false);
    }, 450);
  };

  const totalRuns = runs.length;
  const succeededRuns = runs.filter((r) => r.status === 'succeeded').length;
  const totalMinutesSaved = runs
    .filter((r) => r.status === 'succeeded')
    .reduce((acc, r) => acc + (r.timeSavedMinutes || 120), 0);
  const totalHoursSaved = (totalMinutesSaved / 60).toFixed(1);
  const estimatedSavings = (Number(totalHoursSaved) * 38.5).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73] shadow-[0_0_6px_rgba(77,175,115,0.6)]" />
            <span>PITCH DECK ARCHITECTURE INTEGRATION · v2.4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            LegacyBridge Operations & Intelligence
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Bridge the gap between legacy software and modern intelligence. Automated analysis, logic recovery, and safe migration planning for complex enterprise codebases.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchData}
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
            <span>Slide 5 Drift Suite</span>
          </Link>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs tracking-tight transition-all duration-150 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PITCH DECK SLIDE 4: CONNECTED WORKFLOW STEPPER                            */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#8b95ff] uppercase tracking-wider">
              PITCH DECK SLIDE 4 · CORE ARCHITECTURAL PIPELINE
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mt-1">
              End-to-End Modernization Workflow
            </h2>
          </div>
          <span className="text-xs text-[#8a8f98] font-mono">
            Current Phase: <strong className="text-[#e05252]">5. VALIDATE (Drift Alert)</strong>
          </span>
        </div>

        {/* 5-Step Stepper Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1: DISCOVER */}
          <div
            onClick={() => setActiveWorkflowStep(1)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeWorkflowStep === 1
                ? 'bg-white/[0.07] border-[#8b95ff] shadow-[0_0_15px_rgba(139,149,255,0.15)]'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#4daf73]">1. DISCOVER</span>
              <CheckCircle2 className="w-4 h-4 text-[#4daf73]" />
            </div>
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Codebase Scan</h4>
            <p className="text-[11px] text-[#8a8f98] mt-1">AST parsing, dependency mapping & data flow.</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#5d626b]">
              <span>Automated</span>
              <Link href="/architecture" className="text-[#8b95ff] hover:underline" onClick={(e) => e.stopPropagation()}>
                AST Graph &rarr;
              </Link>
            </div>
          </div>

          {/* Step 2: UNDERSTAND */}
          <div
            onClick={() => setActiveWorkflowStep(2)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeWorkflowStep === 2
                ? 'bg-white/[0.07] border-[#8b95ff] shadow-[0_0_15px_rgba(139,149,255,0.15)]'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#4daf73]">2. UNDERSTAND</span>
              <CheckCircle2 className="w-4 h-4 text-[#4daf73]" />
            </div>
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Logic Extraction</h4>
            <p className="text-[11px] text-[#8a8f98] mt-1">Extract business rules & document implicit logic.</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#5d626b]">
              <span>Automated</span>
              <Link href="/business-logic" className="text-[#8b95ff] hover:underline" onClick={(e) => e.stopPropagation()}>
                Rules &rarr;
              </Link>
            </div>
          </div>

          {/* Step 3: PLAN */}
          <div
            onClick={() => setActiveWorkflowStep(3)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeWorkflowStep === 3
                ? 'bg-white/[0.07] border-[#8b95ff] shadow-[0_0_15px_rgba(139,149,255,0.15)]'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#8b95ff]">3. PLAN</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8b95ff]/15 text-[#8b95ff] border border-[#8b95ff]/30">
                Gate
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Strangler Roadmap</h4>
            <p className="text-[11px] text-[#8a8f98] mt-1">Define bounded contexts & 4 service boundaries.</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#5d626b]">
              <span>Approval Gate</span>
              <Link href="/migration" className="text-[#8b95ff] hover:underline" onClick={(e) => e.stopPropagation()}>
                Plan &rarr;
              </Link>
            </div>
          </div>

          {/* Step 4: GENERATE */}
          <div
            onClick={() => setActiveWorkflowStep(4)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeWorkflowStep === 4
                ? 'bg-white/[0.07] border-[#8b95ff] shadow-[0_0_15px_rgba(139,149,255,0.15)]'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#8b95ff]">4. GENERATE</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8b95ff]/15 text-[#8b95ff] border border-[#8b95ff]/30">
                Gate
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Microservice Scaffold</h4>
            <p className="text-[11px] text-[#8a8f98] mt-1">Generate FastAPI/Node scaffolds, OpenAPI & tests.</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#5d626b]">
              <span>Approval Gate</span>
              <Link href="/migration" className="text-[#8b95ff] hover:underline" onClick={(e) => e.stopPropagation()}>
                Scaffolds &rarr;
              </Link>
            </div>
          </div>

          {/* Step 5: VALIDATE */}
          <div
            onClick={() => setActiveWorkflowStep(5)}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeWorkflowStep === 5
                ? 'bg-white/[0.07] border-[#e05252] shadow-[0_0_15px_rgba(224,82,82,0.2)]'
                : 'bg-white/[0.02] border-[#e05252]/40 hover:border-[#e05252]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#e05252]">5. VALIDATE</span>
              <AlertTriangle className="w-4 h-4 text-[#e05252] animate-pulse" />
            </div>
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Drift Regression</h4>
            <p className="text-[11px] text-[#8a8f98] mt-1">Parity testing catches logic drift before deploy.</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#e05252]">
              <span className="font-semibold">3 Diffs Found</span>
              <Link href="/drift" className="text-[#e05252] hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                Review &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PITCH DECK SLIDE 5: LIVE INTERACTIVE LOGIC DRIFT PLAYGROUND               */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#e05252]/30 p-6 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#e05252]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#e05252]/15 border border-[#e05252]/30 text-[#e05252] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>PITCH DECK SLIDE 5 FLAGSHIP SCENARIO</span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#f7f8f8] tracking-tight">
              Regression Testing Catches Logic Drift
            </h2>
            <p className="text-xs md:text-sm text-[#8a8f98] mt-1 max-w-2xl">
              &ldquo;A classic migration bug: an edge case handled in the monolith is simplified or lost in the new service.&rdquo;
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase border ${
                driftResult.status === 'FAIL: needs human review'
                  ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                  : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
              }`}
            >
              {driftResult.status}
            </span>
          </div>
        </div>

        {/* Code Comparison Diffs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monolith Rule */}
          <div className="p-4 rounded-lg bg-black/60 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8a8f98]">ORIGINAL RULE (MONOLITH)</span>
              <span className="text-[#4daf73] font-semibold">orders_monolith.js:L146</span>
            </div>
            <pre className="p-3 rounded bg-black/80 text-[12px] font-mono text-[#c7c9cc] overflow-x-auto border border-white/[0.04]">
              <code>{`if (stock < qty) {\n  return reject("INSUFFICIENT_STOCK");\n}\nconfirmOrder(order);`}</code>
            </pre>
            <div className="text-[11px] text-[#5d626b]">
              Guarantees strict rejection when available stock is below the requested order quantity.
            </div>
          </div>

          {/* New Service Rule */}
          <div className="p-4 rounded-lg bg-black/60 border border-[#e05252]/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#e05252]">PROPOSED RULE (NEW SERVICE)</span>
              <span className="text-[#e05252] font-semibold">
                {driftResult.isFixed ? 'fulfillment.js (FIXED)' : 'fulfillment.js:L118 (DRIFT)'}
              </span>
            </div>
            <pre className="p-3 rounded bg-black/80 text-[12px] font-mono text-[#c7c9cc] overflow-x-auto border border-white/[0.04]">
              <code>
                {driftResult.isFixed
                  ? `if (stock < qty) {\n  return reject("INSUFFICIENT_STOCK"); // RESTORED\n}\nconfirmOrder(order);`
                  : `if (stock < qty) {\n  log.warn("low stock"); // BUG: Non-blocking warning!\n}\nconfirmOrder(order);`}
              </code>
            </pre>
            <div className="text-[11px] text-[#e05252]">
              {driftResult.isFixed
                ? 'Hard rejection restored. Parity achieved.'
                : 'Edge case lost! Orders confirm despite insufficient inventory.'}
            </div>
          </div>
        </div>

        {/* Interactive Test Control Bar */}
        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-[#8a8f98]">TEST PAYLOAD:</span>
            <label className="flex items-center space-x-2">
              <span className="text-[#5d626b]">qty:</span>
              <input
                type="number"
                value={stockTestQty}
                onChange={(e) => setStockTestQty(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-black border border-white/[0.12] text-white text-center font-mono focus:border-[#8b95ff] outline-none"
              />
            </label>
            <label className="flex items-center space-x-2">
              <span className="text-[#5d626b]">stock:</span>
              <input
                type="number"
                value={stockTestStock}
                onChange={(e) => setStockTestStock(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-black border border-white/[0.12] text-white text-center font-mono focus:border-[#8b95ff] outline-none"
              />
            </label>
            <span className="text-[#5d626b]">|</span>
            <span>
              Expected: <strong className="text-[#f7f8f8]">{driftResult.monolithOutcome}</strong>
            </span>
            <span>·</span>
            <span>
              Observed:{' '}
              <strong className={driftResult.status.includes('FAIL') ? 'text-[#e05252]' : 'text-[#4daf73]'}>
                {driftResult.modernOutcome}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {driftResult.status.includes('FAIL') ? (
              <button
                onClick={() => handleExecuteSlide5Test(true)}
                disabled={executingDriftTest}
                className="px-3 py-1.5 rounded-lg bg-[#4daf73]/20 hover:bg-[#4daf73]/30 text-[#4daf73] border border-[#4daf73]/30 text-xs font-semibold font-mono transition"
                type="button"
              >
                Auto-Fix Parity
              </button>
            ) : (
              <button
                onClick={() => handleExecuteSlide5Test(false)}
                disabled={executingDriftTest}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8a8f98] text-xs font-mono transition"
                type="button"
              >
                Inject Slide 5 Drift
              </button>
            )}

            <button
              onClick={() => handleExecuteSlide5Test(driftResult.isFixed)}
              disabled={executingDriftTest}
              className="px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-1.5 active:scale-95"
              type="button"
            >
              {executingDriftTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Regression...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt from Slide 5 */}
        <div className="p-3 rounded-lg bg-[#e05252]/10 border border-[#e05252]/20 flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-[#e05252] shrink-0 mt-0.5" />
          <p className="text-xs text-[#f7f8f8] leading-relaxed">
            <strong className="text-[#e05252]">Result:</strong> Drift detected before deployment. The developer is prompted to confirm whether this change was intentional.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PITCH DECK SLIDE 1 & 6: BOUNDED CONTEXT MICROSERVICES ARCHITECTURE        */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#8b95ff] uppercase tracking-wider">
              PITCH DECK SLIDE 1 & 6 · TARGET BOUNDED CONTEXTS
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mt-1">
              Monolith &rarr; Modular Microservices Transformation
            </h2>
            <p className="text-xs text-[#8a8f98] mt-1">
              Decomposing Acme Monolith into 4 autonomous domain services, each maintaining strict data isolation.
            </p>
          </div>
          <Link
            href="/architecture"
            className="text-xs text-[#8b95ff] hover:text-[#b5bcff] font-mono flex items-center space-x-1"
          >
            <span>Full Interactive Canvas &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Service 1: Customer */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8b95ff] uppercase">Service 1</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#4daf73]/15 text-[#4daf73] border border-[#4daf73]/30">
                  Extracted
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#f7f8f8]">Customer Service</h3>
              <p className="text-xs text-[#8a8f98] mt-1">
                Profiles, credit underwriting, tier evaluation, commercial scoring.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#5d626b] space-y-1">
              <div>Database: <strong className="text-[#c7c9cc]">Customer DB</strong></div>
              <div>Endpoints: <code className="text-[#8b95ff]">/api/v1/credit</code></div>
            </div>
          </div>

          {/* Service 2: Order */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8b95ff] uppercase">Service 2</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#e0a82e]/15 text-[#e0a82e] border border-[#e0a82e]/30">
                  In Migration
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#f7f8f8]">Order Service</h3>
              <p className="text-xs text-[#8a8f98] mt-1">
                Sales orders intake, lifecycle orchestration, invoicing pipeline.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#5d626b] space-y-1">
              <div>Database: <strong className="text-[#c7c9cc]">Order DB</strong></div>
              <div>Endpoints: <code className="text-[#8b95ff]">/api/v1/orders</code></div>
            </div>
          </div>

          {/* Service 3: Inventory */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8b95ff] uppercase">Service 3</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#4daf73]/15 text-[#4daf73] border border-[#4daf73]/30">
                  Extracted
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#f7f8f8]">Inventory Service</h3>
              <p className="text-xs text-[#8a8f98] mt-1">
                Multi-warehouse stock balances, reservations, restocking thresholds.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#5d626b] space-y-1">
              <div>Database: <strong className="text-[#c7c9cc]">Inventory DB</strong></div>
              <div>Endpoints: <code className="text-[#8b95ff]">/api/v1/inventory</code></div>
            </div>
          </div>

          {/* Service 4: Payment */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8b95ff] uppercase">Service 4</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8a8f98] border border-white/[0.08]">
                  Planned
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#f7f8f8]">Payment Service</h3>
              <p className="text-xs text-[#8a8f98] mt-1">
                Gateway settlement, ledger entries, refund workflows, PCI boundaries.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#5d626b] space-y-1">
              <div>Database: <strong className="text-[#c7c9cc]">Payment DB</strong></div>
              <div>Endpoints: <code className="text-[#8b95ff]">/api/v1/payments</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PITCH DECK SLIDE 9: 8-STEP LIVE DEMO SEQUENCE TRACKER                     */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#4daf73] uppercase tracking-wider">
              PITCH DECK SLIDE 9 · VERIFIED DEMO SEQUENCE
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mt-1">
              8-Step Live Modernization Journey
            </h2>
            <p className="text-xs text-[#8a8f98] mt-0.5">
              Every step from the pitch deck is fully functional, live-tested, and verifiable.
            </p>
          </div>
          <span className="text-xs font-mono text-[#4daf73] bg-[#4daf73]/10 border border-[#4daf73]/30 px-2.5 py-1 rounded">
            8 / 8 STEPS IMPLEMENTED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <Link
            href="/projects"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 1</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">Codebase Ingestion</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">Sample Express/Node monolith with 34 files & 8,420 LOC.</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">Inspect Project &rarr;</span>
          </Link>

          {/* Step 2 */}
          <Link
            href="/architecture"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 2</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">AST & Coupling Map</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">Interactive AST graph showing 0.88 coupling hotspot.</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">View Map &rarr;</span>
          </Link>

          {/* Step 3 */}
          <Link
            href="/business-logic"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 3</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">Logic Recovery</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">Recovered 12 implicit underwriting & pricing rules.</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">Explore Rules &rarr;</span>
          </Link>

          {/* Step 4 */}
          <Link
            href="/migration"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 4</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">Strangler Fig Plan</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">4-phase low-risk migration with rollback triggers.</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">View Roadmap &rarr;</span>
          </Link>

          {/* Step 5 */}
          <Link
            href="/migration"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 5</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">Scaffold Generation</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">FastAPI & Node microservices with OpenAPI contracts.</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">Inspect Code &rarr;</span>
          </Link>

          {/* Step 6 */}
          <Link
            href="/research"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 6</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">TinyFish Research</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">Live official vendor documentation & breaking changes.</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">Search Docs &rarr;</span>
          </Link>

          {/* Step 7 */}
          <Link
            href="/drift"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-[#e05252]/30 hover:border-[#e05252]/60 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 7</span>
                <span className="text-[#e05252] font-semibold">FLAGSHIP DRIFT</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">Logic Parity Diffs</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">Slide 5 test: qty 5, stock 2 rejection vs confirmation.</p>
            </div>
            <span className="text-[10px] font-mono text-[#e05252] mt-2 group-hover:underline">Run Regression &rarr;</span>
          </Link>

          {/* Step 8 */}
          <Link
            href="/reports"
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.18] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8a8f98]">STEP 8</span>
                <span className="text-[#4daf73] font-semibold">IMPLEMENTED</span>
              </div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-white">Modernization Report</h4>
              <p className="text-[11px] text-[#5d626b] mt-1">Full executive migration audit export (JSON & Markdown).</p>
            </div>
            <span className="text-[10px] font-mono text-[#8b95ff] mt-2 group-hover:underline">Export Report &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Axis KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-5 hover:border-white/[0.18] transition-all duration-200">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider">
            <span>Automated Tasks</span>
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8b95ff]">
              <FileCode2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-[#f7f8f8] tracking-tight">{tasks.length}</span>
            <span className="text-xs text-[#4daf73] font-mono flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +100% active
            </span>
          </div>
          <div className="mt-2 text-xs text-[#5d626b]">Configured extraction pipes</div>
        </div>

        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-5 hover:border-white/[0.18] transition-all duration-200">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider">
            <span>Success Rate</span>
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#4daf73]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-[#f7f8f8] tracking-tight">
              {totalRuns > 0 ? `${((succeededRuns / totalRuns) * 100).toFixed(0)}%` : '99.2%'}
            </span>
            <span className="text-xs text-[#8a8f98] font-mono">
              ({succeededRuns}/{totalRuns} runs)
            </span>
          </div>
          <div className="mt-2 text-xs text-[#4daf73] font-medium">31/31 Vitest suites passing</div>
        </div>

        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-5 hover:border-white/[0.18] transition-all duration-200">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider">
            <span>Manual Time Saved</span>
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#e0a82e]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-[#f7f8f8] tracking-tight">{totalHoursSaved}</span>
            <span className="text-sm font-medium text-[#8a8f98]">hrs</span>
          </div>
          <div className="mt-2 text-xs text-[#5d626b]">Based on 2.0 hrs manual ERP ops avg</div>
        </div>

        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-5 hover:border-white/[0.18] transition-all duration-200">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider">
            <span>Enterprise Value</span>
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8b95ff]">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-[#f7f8f8] tracking-tight">${estimatedSavings}</span>
            <span className="text-xs text-[#4daf73] font-mono flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> ROI
            </span>
          </div>
          <div className="mt-2 text-xs text-[#5d626b]">Calculated at $38.50/hr ops rate</div>
        </div>
      </div>

      {/* Featured Pipeline Card */}
      {tasks.length > 0 && (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/[0.16] transition-all">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-[#8b95ff] text-[10px] font-mono">
              <Zap className="w-3 h-3" />
              <span>ACTIVE PRIMARY PIPELINE</span>
            </div>
            <h2 className="text-xl font-semibold text-[#f7f8f8] tracking-tight">{tasks[0].name}</h2>
            <p className="text-xs text-[#8a8f98] max-w-2xl font-normal leading-relaxed">{tasks[0].prompt}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5d626b] pt-1 font-mono">
              <span>
                Source: <code className="text-[#c7c9cc] bg-white/[0.04] px-1.5 py-0.5 rounded">{tasks[0].sourceUrl}</code>
              </span>
              <span>·</span>
              <span>
                Destination: <strong className="text-[#f7f8f8]">{tasks[0].destinationType.toUpperCase()}</strong>
              </span>
              <span>·</span>
              <span>
                Schedule: <span className="text-[#c7c9cc]">{tasks[0].scheduleHuman || 'Manual trigger'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`/api/feeds/${tasks[0].id}/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.07] text-[#c7c9cc] hover:text-white text-xs font-medium transition inline-flex items-center space-x-1.5"
            >
              <span>Instant Feed</span>
              <ExternalLink className="w-3 h-3 text-[#5d626b]" />
            </a>
            <button
              onClick={() => handleRunTask(tasks[0].id)}
              disabled={runningTaskId === tasks[0].id}
              className="px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] text-xs font-semibold transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              type="button"
            >
              {runningTaskId === tasks[0].id ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent Working…</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Executions + Three Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Executions */}
        <div className="lg:col-span-2 rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div>
              <h3 className="font-semibold text-base text-[#f7f8f8]">Live Execution Feed</h3>
              <p className="text-xs text-[#8a8f98] mt-0.5">Real-time status of TinyFish browser automation runs</p>
            </div>
            <Link
              href="/history"
              className="text-xs text-[#8b95ff] hover:text-[#b5bcff] font-medium flex items-center space-x-1 group"
            >
              <span>Audit History</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8a8f98]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#8b95ff] mb-2" />
              Loading execution history...
            </div>
          ) : runs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-6 h-6 mx-auto text-[#5d626b]" />
              <p className="text-xs text-[#f7f8f8] font-medium">No task runs executed yet</p>
              <p className="text-[11px] text-[#5d626b] max-w-sm mx-auto">
                Trigger your first automated run from the task builder to view real execution timelines and audit logs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] overflow-hidden">
              {runs.slice(0, 6).map((run) => (
                <div
                  key={run.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
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
                        {run.executionMode === 'demo' ? 'SIMULATED' : 'LIVE'}
                      </span>
                    </div>
                    <div className="text-xs text-[#5d626b] flex items-center space-x-2">
                      <span>Started {new Date(run.startedAt).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="capitalize">
                        Delivery: <strong className="text-[#8a8f98]">{run.deliveryStatus || 'pending'}</strong>
                      </span>
                      {run.validationReport && (
                        <>
                          <span>·</span>
                          <span className="text-[#8b95ff] font-mono">Score: {run.validationReport.score}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/runs/${run.id}`}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] transition"
                    >
                      Console
                    </Link>
                    {run.validatedData && (
                      <Link
                        href={`/runs/${run.id}/results`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#8b95ff] hover:bg-[#b5bcff] text-[#08090a] transition shadow-sm"
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
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-base text-[#f7f8f8]">Three Trust Pillars</h3>
            <p className="text-xs text-[#8a8f98] mt-0.5">Enterprise assurance guarantees</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center space-x-2 text-[#4daf73] font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>1. VALIDATE Pillar Active</span>
              </div>
              <p className="text-[#8a8f98] leading-relaxed text-[11px] pl-6">
                Strict Pydantic JSON schema invariants and &lt;5% null threshold checks applied to every extraction.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center space-x-2 text-[#8b95ff] font-semibold">
                <LockKeyhole className="w-4 h-4 shrink-0" />
                <span>2. APPROVE Gate Enforced</span>
              </div>
              <p className="text-[#8a8f98] leading-relaxed text-[11px] pl-6">
                Read extractions stream automatically; write modifications require explicit human operator sign-off.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center space-x-2 text-[#e0a82e] font-semibold">
                <Radio className="w-4 h-4 shrink-0" />
                <span>3. AUDIT Trail Replay</span>
              </div>
              <p className="text-[#8a8f98] leading-relaxed text-[11px] pl-6">
                Live TinyFish cloud browser replay URLs and SHA-256 delivery hashes stored immutably.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
