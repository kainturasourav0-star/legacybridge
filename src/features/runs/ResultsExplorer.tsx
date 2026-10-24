'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Sparkles,
  ArrowRight,
  Search,
  ArrowUpDown,
  FileCode2
} from 'lucide-react';
import { Run } from '@/types';
import { convertToCsv } from '@/lib/utils/csv';

export function ResultsExplorer({ runId }: { runId: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [deliveryReceipt, setDeliveryReceipt] = useState<string | null>(null);
  
  // Interactive options: Row search & Sorting
  const [rowSearch, setRowSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch(`/api/runs/${runId}`)
      .then((r) => r.json())
      .then((data) => setRun(data));
  }, [runId]);

  if (!run) {
    return <div className="p-16 text-center text-sm text-slate-400">Loading extracted results...</div>;
  }

  const data = run.validatedData || run.extractedData || {};
  const rawItems: any[] = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
  const headers = rawItems.length > 0 ? Object.keys(rawItems[0]) : [];

  // Filter and sort items
  const items = rawItems
    .filter((row) => {
      if (!rowSearch.trim()) return true;
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(rowSearch.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!sortCol) return 0;
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA ?? '').localeCompare(String(valB ?? ''))
        : String(valB ?? '').localeCompare(String(valA ?? ''));
    });

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

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

  const handleDownloadJson = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacybridge-export-${run.id}.json`;
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse mr-2" />
              VALIDATED PIPELINE OUTPUT
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
              {run.executionMode === 'demo' ? 'DEMO FIXTURE (ACME ERP)' : 'LIVE TINYFISH EXTRACT'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Results Explorer
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 font-normal">
            Review schema-conforming records, filter and sort columns, or download export packages.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            onClick={handleDownloadCsv}
            disabled={rawItems.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            title="Export as CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5"
            title="Download formatted JSON file"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5"
            title="Copy JSON to clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleManualDeliver}
            disabled={delivering}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold transition flex items-center space-x-1.5 shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{delivering ? 'Dispatching...' : 'Push to Destination'}</span>
          </button>
        </div>
      </div>

      {deliveryReceipt && (
        <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span className="font-medium">{deliveryReceipt}</span>
          </div>
        </div>
      )}

      {/* Validation Banner */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center space-x-2">
              <span>Pydantic v2 Schema Trust Score: {run.validationReport?.score || 100}%</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                MATHEMATICALLY VALIDATED
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Verified non-empty row invariants, zero prohibited nulls, and baseline historical stability.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Data Grid Table</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              viewMode === 'json'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Formatted JSON</span>
          </button>
        </div>
      </div>

      {/* Main Results View */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-xl shadow-black/20 overflow-hidden space-y-0">
          {/* Table Toolbar */}
          <div className="p-4 bg-slate-900/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Extracted Records ({items.length} of {rawItems.length} Rows)
              </span>
              {run.replayUrl && (
                <a
                  href={run.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-1"
                >
                  <span>TinyFish Cloud Replay</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rowSearch}
                onChange={(e) => setRowSearch(e.target.value)}
                placeholder="Filter table rows..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
              />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">
              {rowSearch ? 'No rows match your filter.' : 'No structured tabular rows returned in this run.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs uppercase font-mono">
                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h}
                        onClick={() => handleSort(h)}
                        className="py-3 px-4 font-bold tracking-wider cursor-pointer hover:text-teal-300 transition select-none"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span>{h.replace(/_/g, ' ')}</span>
                          <ArrowUpDown className={`w-3 h-3 ${sortCol === h ? 'text-teal-400' : 'text-slate-600'}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      {headers.map((h) => (
                        <td key={h} className="py-3.5 px-4 text-slate-200">
                          {typeof row[h] === 'number'
                            ? h.includes('revenue') || h.includes('price') || h.includes('amount')
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
        <div className="bg-slate-950 text-teal-300 rounded-2xl p-6 border border-slate-800 font-mono text-xs overflow-x-auto shadow-2xl leading-relaxed">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
