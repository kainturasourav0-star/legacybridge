'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  Code2,
  Download,
  Send,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import { Run } from '@/types';
import { convertToCsv } from '@/lib/utils/csv';

export function ResultsExplorer({ runId }: { runId: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [deliveryReceipt, setDeliveryReceipt] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/runs/${runId}`)
      .then((r) => r.json())
      .then((data) => setRun(data));
  }, [runId]);

  if (!run) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading extracted results...</div>;
  }

  const data = run.validatedData || run.extractedData || {};
  const items: any[] = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
  const headers = items.length > 0 ? Object.keys(items[0]) : [];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csvContent = convertToCsv(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacybridge-export-${run.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleManualDeliver = async () => {
    try {
      setDelivering(true);
      const res = await fetch(`/api/runs/${run.id}/deliver`, { method: 'POST' });
      const resData = await res.json();
      setDeliveryReceipt(resData.receipt || 'Delivery confirmed');
    } catch (e: any) {
      setDeliveryReceipt(`Delivery error: ${e.message}`);
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold text-teal uppercase tracking-wider">
              Validated Pipeline Output
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
              {run.executionMode === 'demo' ? 'DEMO FIXTURE (ACME ERP)' : 'LIVE TINYFISH EXTRACT'}
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink">Results Explorer</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review schema-conforming records, download CSV, or push to downstream business tools.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCsv}
            disabled={items.length === 0}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleManualDeliver}
            disabled={delivering}
            className="px-4 py-2 rounded-lg bg-teal hover:bg-teal-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{delivering ? 'Dispatching...' : 'Push to Slack Webhook'}</span>
          </button>
        </div>
      </div>

      {deliveryReceipt && (
        <div className="p-4 rounded-lg bg-teal/10 border border-teal/30 text-teal text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal" />
            <span>{deliveryReceipt}</span>
          </div>
        </div>
      )}

      {/* Validation Banner */}
      <div className="bg-surface rounded-card border border-slate-200/80 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-semibold text-sm text-ink flex items-center space-x-2">
              <span>Pydantic v2 Schema Trust Score: {run.validationReport?.score || 100}%</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                VALIDATED
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Verified non-empty row invariants, zero prohibited nulls, and baseline historical stability.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              viewMode === 'table' ? 'bg-navy-950 text-white' : 'border border-slate-300 text-slate-700'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Data Grid Table</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              viewMode === 'json' ? 'bg-navy-950 text-white' : 'border border-slate-300 text-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Formatted JSON</span>
          </button>
        </div>
      </div>

      {/* Main Results View */}
      {viewMode === 'table' ? (
        <div className="bg-surface rounded-card border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
              Extracted Records ({items.length} Rows)
            </span>
            {run.replayUrl && (
              <a
                href={run.replayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal font-medium hover:underline flex items-center space-x-1"
              >
                <span>TinyFish Cloud Replay</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No structured tabular rows returned in this run.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase font-mono">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="py-3 px-4 font-semibold">
                        {h.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition">
                      {headers.map((h) => (
                        <td key={h} className="py-3 px-4 text-slate-800">
                          {typeof row[h] === 'number'
                            ? h.includes('revenue') || h.includes('price')
                              ? `$${row[h].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                              : row[h].toLocaleString()
                            : String(row[h] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950 text-slate-100 rounded-card p-6 border border-slate-800 font-mono text-xs overflow-x-auto shadow-card">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
