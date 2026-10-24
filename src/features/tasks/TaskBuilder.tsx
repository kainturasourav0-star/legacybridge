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
  AlertCircle
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
        router.push('/');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while creating task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal tracking-wider uppercase mb-1">
            Task Orchestration
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">Task Builder</h1>
          <p className="text-sm text-slate-600 mt-1">
            Formulate natural-language browser workflows with schema validation and delivery pipes.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleTask}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-teal/10 hover:bg-teal/20 text-teal text-xs font-semibold transition border border-teal/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Acme ERP Demo Preset</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <div className="font-semibold">Unable to process task</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-5">
            {/* Task Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Task Identifier Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 Regional Sales Extraction & Ops Report"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </div>

            {/* Natural Language Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Plain-English Task Instruction
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what the agent should find and extract from the legacy portal..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Example: &ldquo;Open the inventory portal, pull Q3 sales by region and post the table to #ops-reports.&rdquo;
              </p>
            </div>

            {/* Source Website URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Source Legacy Portal URL</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Authorized test targets: Localhost Acme ERP (<code className="font-mono text-slate-700">http://localhost:8080</code>) or public HTTPS portals.
              </p>
            </div>

            {/* Delivery Destination Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5 text-slate-500" />
                  <span>Delivery Destination</span>
                </label>
                <select
                  value={destinationType}
                  onChange={(e) => setDestinationType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                >
                  <option value="slack">Slack Channel Webhook</option>
                  <option value="sheets">Google Sheets (Service Account)</option>
                  <option value="csv">Direct CSV / JSON Download</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Destination Target Channel / Name
                </label>
                <input
                  type="text"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  placeholder="#ops-reports"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
            </div>

            {/* Schedule & Write Gate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recurrence Schedule</span>
                </label>
                <input
                  type="text"
                  value={scheduleHuman}
                  onChange={(e) => setScheduleHuman(e.target.value)}
                  placeholder="e.g. Every weekday at 7:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="relative flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWriteAction}
                    onChange={(e) => setIsWriteAction(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-teal focus:ring-teal/30 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Require Human Approval Gate</span>
                    <span className="block text-slate-500">Enable for write actions or portal state mutations.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Editable JSON Schema View */}
          <div className="bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Expected Output JSON Schema (Pydantic Invariant)</span>
              </label>
              <span className="text-[11px] text-teal font-mono">Pydantic v2 Compliant</span>
            </div>
            <textarea
              rows={8}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <p className="text-xs text-slate-500">
              The agent output must strictly conform to these invariants; failure triggers the self-healing validation loop.
            </p>
          </div>
        </div>

        {/* Right Col: Live Preview & Action Bar */}
        <div className="space-y-6">
          <div className="bg-navy-950 text-white rounded-card border border-navy-800 p-6 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-white">Execution Plan Preview</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 font-medium">Browser Agent Provider</div>
                <div className="text-slate-200 font-semibold mt-0.5">TinyFish Cloud Agent (v1/automation)</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Validation Strategy</div>
                <div className="text-slate-200 font-semibold mt-0.5">Strict Schema + 5% Null Limit + Drift Check</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Delivery Mode</div>
                <div className="text-slate-200 font-semibold mt-0.5">Idempotent Webhook ({destinationType.toUpperCase()})</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Hero REST Endpoint</div>
                <div className="text-teal font-mono mt-0.5 break-all">GET /api/feeds/:id/latest</div>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-800 space-y-2.5">
              <button
                type="button"
                onClick={() => handleSaveOrRun(true)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-teal hover:bg-teal-700 text-white font-semibold text-sm transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{loading ? 'Processing...' : 'Save & Run Task Immediately'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveOrRun(false)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-700 bg-navy-900 hover:bg-navy-800 text-slate-200 font-medium text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
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
