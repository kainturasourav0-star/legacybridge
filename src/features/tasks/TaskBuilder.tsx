'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Play,
  Save,
  Globe,
  Calendar,
  Layers3,
  Code2,
  AlertCircle,
  Zap,
  AlignLeft,
  Database,
  ArrowRight,
  Hash,
  Table2,
  Webhook,
} from 'lucide-react';

export function TaskBuilder() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sourceUrl, setSourceUrl] = useState('http://localhost:8080');
  const [destinationType, setDestinationType] = useState<'slack' | 'sheets' | 'csv' | 'webhook' | 'postgres'>('slack');

  // Destination specific fields
  const [slackChannel, setSlackChannel] = useState('#ops-reports');
  const [sheetName, setSheetName] = useState('Q3_Sales_Master');
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/mock-target');
  const [targetTable, setTargetTable] = useState('inventory_orders');

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

  const loadPreset = (presetKey: 'sales' | 'reorder' | 'supplier') => {
    setError(null);
    if (presetKey === 'sales') {
      setName('Acme ERP Q3 Sales by Region');
      setPrompt('Open the inventory portal, retrieve Q3 sales by region, and send the results to our operations Slack channel.');
      setSourceUrl('http://localhost:8080');
      setDestinationType('slack');
      setSlackChannel('#ops-reports');
      setScheduleHuman('Every weekday at 7:30 AM');
      setIsWriteAction(false);
      setSchemaText(
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
    } else if (presetKey === 'reorder') {
      setName('Weekly Below-Threshold Stock Trigger');
      setPrompt('Navigate to Inventory Levels, identify all items with Available Quantity less than Safety Stock, and update reorder records.');
      setSourceUrl('http://localhost:8080');
      setDestinationType('webhook');
      setWebhookUrl('https://api.acmelogistics.internal/procurement/webhook');
      setScheduleHuman('Every Monday at 9:00 AM');
      setIsWriteAction(true);
      setSchemaText(
        JSON.stringify(
          {
            type: 'object',
            required: ['exceptions_found', 'items'],
            properties: {
              exceptions_found: { type: 'integer' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['part_number', 'description', 'current_stock', 'safety_threshold'],
                  properties: {
                    part_number: { type: 'string' },
                    description: { type: 'string' },
                    current_stock: { type: 'integer' },
                    safety_threshold: { type: 'integer' },
                  },
                },
              },
            },
          },
          null,
          2
        )
      );
    } else if (presetKey === 'supplier') {
      setName('Active Vendor Invoice Monitor');
      setPrompt('Check pending vendor payments for the current accounting period and export the table to our Google Sheet.');
      setSourceUrl('http://localhost:8080');
      setDestinationType('sheets');
      setSheetName('Vendor_Audit_Master');
      setScheduleHuman('Daily at 6:45 AM');
      setIsWriteAction(false);
      setSchemaText(
        JSON.stringify(
          {
            type: 'object',
            required: ['invoice_count', 'invoices'],
            properties: {
              invoice_count: { type: 'integer' },
              invoices: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['invoice_id', 'vendor_name', 'amount_due', 'due_date'],
                  properties: {
                    invoice_id: { type: 'string' },
                    vendor_name: { type: 'string' },
                    amount_due: { type: 'string' },
                    due_date: { type: 'string' },
                  },
                },
              },
            },
          },
          null,
          2
        )
      );
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(schemaText);
      setSchemaText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError('Invalid JSON schema format. Please verify syntax.');
    }
  };

  const handleSaveOrRun = async (runNow: boolean) => {
    setError(null);
    if (!name.trim()) {
      setError('Task name is required.');
      return;
    }
    if (!prompt.trim()) {
      setError('Plain-English goal prompt is required.');
      return;
    }

    let parsedSchema: any;
    try {
      parsedSchema = JSON.parse(schemaText);
    } catch {
      setError('Expected JSON schema is invalid syntax.');
      return;
    }

    setLoading(true);

    const destinationConfig: Record<string, any> = {};
    if (destinationType === 'slack') destinationConfig.channel = slackChannel;
    if (destinationType === 'sheets') destinationConfig.spreadsheetId = sheetName;
    if (destinationType === 'webhook') destinationConfig.url = webhookUrl;
    if (destinationType === 'postgres') destinationConfig.table = targetTable;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          prompt,
          sourceUrl,
          destinationType,
          destinationConfig,
          expectedSchema: parsedSchema,
          scheduleHuman,
          isWriteAction,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create task definition.');
      }

      const task = await res.json();

      if (runNow) {
        const runRes = await fetch(`/api/tasks/${task.id}/run`, { method: 'POST' });
        const run = await runRes.json();
        router.push(`/runs/${run.id}`);
      } else {
        router.push('/tasks');
      }
    } catch (err: any) {
      setError(err.message || 'System error occurred while creating task.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TASK BUILDER STUDIO</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Configure Web Automation
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-2xl font-normal leading-relaxed">
            Translate plain-English instructions into resilient browser actions and mathematical validation contracts.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#5d626b] font-mono mr-1 hidden sm:inline">PRESETS:</span>
          <button
            type="button"
            onClick={() => loadPreset('sales')}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] hover:text-white text-xs font-mono transition"
          >
            Q3 Sales
          </button>
          <button
            type="button"
            onClick={() => loadPreset('reorder')}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] hover:text-white text-xs font-mono transition"
          >
            Stock Trigger
          </button>
          <button
            type="button"
            onClick={() => loadPreset('supplier')}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] hover:text-white text-xs font-mono transition"
          >
            Vendor Invoices
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#e05252]/10 border border-[#e05252]/30 text-[#e05252] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-5">
            <div>
              <label className="block text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider mb-2">
                Task Identifier Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme ERP Q3 Sales by Region"
                className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8b95ff]" />
                <span>Plain-English Agent Goal</span>
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what the TinyFish cloud browser should click, navigate, extract, or input..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-[#5d626b]" />
                <span>Target Web Portal URL</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition font-mono"
              />
            </div>

            {/* Destination Selection */}
            <div>
              <label className="block text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider mb-2">
                Delivery Destination
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'slack', label: 'Slack', icon: Hash },
                  { id: 'sheets', label: 'Google Sheets', icon: Table2 },
                  { id: 'webhook', label: 'Webhook', icon: Webhook },
                  { id: 'postgres', label: 'PostgreSQL', icon: Database },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDestinationType(id as any)}
                    className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition ${
                      destinationType === id
                        ? 'border-[#8b95ff] bg-[#5e6ad2]/12 text-[#f7f8f8]'
                        : 'border-white/[0.08] bg-black/40 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Destination Specific Target Field */}
              <div className="mt-3">
                {destinationType === 'slack' && (
                  <input
                    type="text"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    placeholder="#ops-reports"
                    className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition font-mono"
                  />
                )}
                {destinationType === 'sheets' && (
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Q3_Sales_Master"
                    className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition font-mono"
                  />
                )}
                {destinationType === 'webhook' && (
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.yourcompany.com/v1/ingest"
                    className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition font-mono"
                  />
                )}
                {destinationType === 'postgres' && (
                  <input
                    type="text"
                    value={targetTable}
                    onChange={(e) => setTargetTable(e.target.value)}
                    placeholder="inventory_orders"
                    className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition font-mono"
                  />
                )}
              </div>
            </div>

            {/* Schedule & Write Gate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5d626b]" />
                  <span>Recurrence Schedule</span>
                </label>
                <input
                  type="text"
                  value={scheduleHuman}
                  onChange={(e) => setScheduleHuman(e.target.value)}
                  placeholder="e.g. Every weekday at 7:30 AM"
                  className="w-full px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition"
                />
              </div>

              <div className="flex items-center pt-3 sm:pt-6">
                <label className="relative flex items-start space-x-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isWriteAction}
                    onChange={(e) => setIsWriteAction(e.target.checked)}
                    className="w-4 h-4 rounded border-white/[0.2] bg-black text-[#8b95ff] focus:ring-0 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#f7f8f8] group-hover:text-[#8b95ff] transition-colors">
                      Require Human Approval Gate
                    </span>
                    <span className="block text-[11px] text-[#5d626b] mt-0.5">
                      Enable for state-modifying actions or inventory edits.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* JSON Schema View */}
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#8b95ff]" />
                <span>Expected Output JSON Schema</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={formatJson}
                  className="px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[11px] text-[#8a8f98] hover:text-white transition flex items-center space-x-1"
                >
                  <AlignLeft className="w-3 h-3" />
                  <span>Format</span>
                </button>
                <span className="text-[10px] text-[#4daf73] font-mono px-2 py-0.5 rounded bg-[#4daf73]/10 border border-[#4daf73]/25">
                  Pydantic v2
                </span>
              </div>
            </div>
            <textarea
              rows={8}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/[0.08] bg-black font-mono text-xs text-[#8b95ff] focus:outline-none focus:border-[#8b95ff] leading-relaxed"
            />
            <p className="text-[11px] text-[#5d626b]">
              The agent extraction strictly conforms to these invariants; failure triggers quarantine.
            </p>
          </div>
        </div>

        {/* Right Col: Live Preview & Action Bar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center space-x-2 text-[#f7f8f8] font-semibold text-sm border-b border-white/[0.07] pb-3">
              <Zap className="w-4 h-4 text-[#8b95ff]" />
              <span>Execution Plan Preview</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                <div className="text-[#5d626b] text-[11px]">Browser Agent Provider</div>
                <div className="text-[#f7f8f8] font-medium mt-0.5">TinyFish Cloud Agent (v1/automation)</div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                <div className="text-[#5d626b] text-[11px]">Validation Strategy</div>
                <div className="text-[#f7f8f8] font-medium mt-0.5">Strict Schema + Null Check + Anti-Drift</div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                <div className="text-[#5d626b] text-[11px]">Delivery Mode</div>
                <div className="text-[#f7f8f8] font-medium mt-0.5 capitalize">{destinationType.toUpperCase()} Adapter</div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                <div className="text-[#5d626b] text-[11px]">Hero REST Endpoint</div>
                <div className="text-[#8b95ff] font-mono mt-0.5 break-all">GET /api/feeds/:id/latest</div>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => handleSaveOrRun(true)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Processing…' : 'Save & Run Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveOrRun(false)}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] font-medium text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Task Catalog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
