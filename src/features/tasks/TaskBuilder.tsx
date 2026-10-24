'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Play,
  Save,
  Globe,
  Send,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  Code2,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

export function TaskBuilder() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sourceUrl, setSourceUrl] = useState('http://localhost:8080');
  const [destinationType, setDestinationType] = useState<'slack' | 'sheets' | 'csv'>('slack');
  const [slackChannel, setSlackChannel] = useState('#ops-reports');
  const [scheduleHuman, setScheduleHuman] = useState('Every weekday at 7:30 AM');
  const [isWriteAction, setIsWriteAction] = useState(false);
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(
      {
        type: 'object',
        required: ['report_title', 'items', 'total_revenue'],
        properties: {
          report_title: { type: 'string' },
          period: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['region', 'sku', 'units_sold', 'revenue'],
              properties: {
                region: { type: 'string' },
                sku: { type: 'string' },
                units_sold: { type: 'integer' },
                revenue: { type: 'number' },
              },
            },
          },
          total_revenue: { type: 'number' },
        },
      },
      null,
      2
    )
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSampleTask = () => {
    setName('Acme ERP Q3 Sales by Region');
    setPrompt('Open the inventory portal, retrieve Q3 sales by region, and send the results to our operations Slack channel.');
    setSourceUrl('http://localhost:8080');
    setDestinationType('slack');
    setSlackChannel('#ops-reports');
    setScheduleHuman('Every weekday at 7:30 AM');
    setIsWriteAction(false);
    setError(null);
  };

  const handleSaveOrRun = async (shouldRunImmediately: boolean) => {
    setError(null);
    if (!name.trim()) {
      setError('Please provide a task name');
      return;
    }
    if (!prompt.trim() || prompt.length < 10) {
      setError('Please provide a descriptive natural-language instruction (at least 10 characters)');
      return;
    }

    let parsedSchema = {};
    try {
      parsedSchema = JSON.parse(schemaText);
    } catch {
      setError('Output Schema must be valid JSON');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          prompt,
          sourceUrl,
          destinationType,
          destinationConfig: { slackChannel },
          expectedSchema: parsedSchema,
          scheduleHuman,
          isWriteAction,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save task');
      }

      const task = await res.json();

      if (shouldRunImmediately) {
        const runRes = await fetch(`/api/tasks/${task.id}/run`, { method: 'POST' });
        const run = await runRes.json();
        router.push(`/runs/${run.id}`);
      } else {
        router.push('/tasks');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while creating task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>NATURAL LANGUAGE COMPILER</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Task Formulation Studio
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Formulate plain-English browser workflows with Pydantic invariant synthesis and target destinations.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSampleTask}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold transition border border-teal-500/30 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Load Acme ERP Demo Preset</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <div className="font-bold text-white">Validation Error</div>
            <div className="mt-0.5 text-xs text-rose-200">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-5">
            {/* Task Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Task Identifier Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 Regional Sales Extraction & Ops Report"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
              />
            </div>

            {/* Natural Language Prompt */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Plain-English Task Instruction
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what the agent should find and extract from the legacy portal..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition leading-relaxed"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Example: &ldquo;Open the inventory portal, pull Q3 sales by region and post the table to #ops-reports.&rdquo;
              </p>
            </div>

            {/* Source Website URL */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Source Legacy Portal URL</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm font-mono text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Authorized test targets: Localhost Acme ERP (<code className="font-mono text-slate-400">http://localhost:8080</code>) or public HTTPS portals.
              </p>
            </div>

            {/* Delivery Destination Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delivery Destination</span>
                </label>
                <select
                  value={destinationType}
                  onChange={(e) => setDestinationType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
                >
                  <option value="slack">Slack Channel Webhook</option>
                  <option value="sheets">Google Sheets (Service Account)</option>
                  <option value="csv">Direct CSV / JSON Download</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Destination Target Channel / Name
                </label>
                <input
                  type="text"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  placeholder="#ops-reports"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
                />
              </div>
            </div>

            {/* Schedule & Write Gate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/60">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recurrence Schedule</span>
                </label>
                <input
                  type="text"
                  value={scheduleHuman}
                  onChange={(e) => setScheduleHuman(e.target.value)}
                  placeholder="e.g. Every weekday at 7:30 AM"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
                />
              </div>

              <div className="flex items-center pt-4 sm:pt-6">
                <label className="relative flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isWriteAction}
                    onChange={(e) => setIsWriteAction(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500/30 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white group-hover:text-teal-300 transition-colors">
                      Require Human Approval Gate
                    </span>
                    <span className="block text-slate-400 mt-0.5">Enable for state-modifying actions or inventory edits.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Editable JSON Schema View */}
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Expected Output JSON Schema (Pydantic Invariant)</span>
              </label>
              <span className="text-[11px] text-teal-400 font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                Pydantic v2 Compliant
              </span>
            </div>
            <textarea
              rows={8}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 leading-relaxed"
            />
            <p className="text-xs text-slate-500">
              The agent extraction must strictly conform to these invariants; failure triggers the self-healing correction loop.
            </p>
          </div>
        </div>

        {/* Right Col: Live Preview & Action Bar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 shadow-2xl shadow-black/40 space-y-5">
            <div className="flex items-center space-x-2 text-white font-bold text-base border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>Execution Plan Preview</span>
            </div>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 font-medium">Browser Agent Provider</div>
                <div className="text-white font-semibold mt-1">TinyFish Cloud Agent (v1/automation)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 font-medium">Validation Strategy</div>
                <div className="text-white font-semibold mt-1">Strict Schema + 5% Null Limit + Drift Check</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 font-medium">Delivery Mode</div>
                <div className="text-white font-semibold mt-1">Idempotent Webhook ({destinationType.toUpperCase()})</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 font-medium">Hero REST Endpoint</div>
                <div className="text-teal-400 font-mono mt-1 break-all">GET /api/feeds/:id/latest</div>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => handleSaveOrRun(true)}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{loading ? 'Processing...' : 'Save & Run Task Immediately'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveOrRun(false)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Task to Catalog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
