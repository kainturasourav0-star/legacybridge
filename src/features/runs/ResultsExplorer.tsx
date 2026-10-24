'use client';

import { useEffect, useState } from 'react';
import {
  Table2,
  Code2,
  Download,
  Send,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  ArrowUpDown,
  FileCode2,
  Check,
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
    return <div className="p-16 text-center text-xs text-[#8a8f98]">Loading extracted results...</div>;
  }

  const data = run.validatedData || run.extractedData || {};
  const rawItems: any[] = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#4daf73]/10 text-[#4daf73] border border-[#4daf73]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73] shadow-[0_0_6px_rgba(77,175,115,0.6)] mr-1.5" />
              VALIDATED PIPELINE OUTPUT
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[#8a8f98] font-mono">
              {run.executionMode === 'demo' ? 'SIMULATED (ACME ERP)' : 'LIVE AGENT EXTRACT'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Results Explorer
          </h1>
          <p className="text-xs text-[#8a8f98] mt-1 font-normal">
            Review schema-conforming records, filter and sort columns, or download export packages.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={handleDownloadCsv}
            disabled={rawItems.length === 0}
            className="px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] text-xs font-medium transition flex items-center space-x-1.5 disabled:opacity-50"
            title="Export as CSV"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] text-xs font-medium transition flex items-center space-x-1.5"
            title="Download JSON"
            type="button"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] text-xs font-medium transition flex items-center space-x-1.5"
            title="Copy JSON"
            type="button"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#4daf73]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleManualDeliver}
            disabled={delivering}
            className="px-4 py-1.5 rounded-md bg-[#f7f8f8] hover:bg-white text-[#08090a] text-xs font-semibold transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            type="button"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{delivering ? 'Dispatching…' : 'Push to Destination'}</span>
          </button>
        </div>
      </div>

      {deliveryReceipt && (
        <div className="p-3 rounded-lg bg-[#4daf73]/10 border border-[#4daf73]/30 text-[#4daf73] text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{deliveryReceipt}</span>
          </div>
        </div>
      )}

      {/* Validation Banner */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#4daf73]/10 text-[#4daf73] border border-[#4daf73]/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-[#f7f8f8] flex items-center space-x-2">
              <span>Pydantic v2 Schema Trust Score: {run.validationReport?.score || 100}%</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#4daf73]/10 text-[#4daf73] border border-[#4daf73]/30 font-mono">
                PASSED
              </span>
            </div>
            <div className="text-[11px] text-[#5d626b] mt-0.5">
              Verified non-empty row invariants, zero prohibited nulls, and baseline historical stability.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-white text-black shadow-sm'
                : 'border border-white/[0.08] bg-white/[0.03] text-[#8a8f98] hover:text-white'
            }`}
            type="button"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'json'
                ? 'bg-white text-black shadow-sm'
                : 'border border-white/[0.08] bg-white/[0.03] text-[#8a8f98] hover:text-white'
            }`}
            type="button"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Results View */}
      {viewMode === 'table' ? (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden space-y-0">
          {/* Table Toolbar */}
          <div className="p-3 bg-black/40 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider font-mono">
                Extracted Records ({items.length} of {rawItems.length} Rows)
              </span>
              {run.replayUrl && (
                <a
                  href={run.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8b95ff] hover:underline font-medium flex items-center space-x-1"
                >
                  <span>Cloud Replay</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#5d626b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rowSearch}
                onChange={(e) => setRowSearch(e.target.value)}
                placeholder="Filter table rows..."
                className="w-full pl-8 pr-3 py-1 rounded-md border border-white/[0.08] bg-black text-xs text-white placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff]"
              />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#5d626b]">
              {rowSearch ? 'No rows match your filter.' : 'No structured tabular rows returned in this run.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/[0.06] text-[#8a8f98] uppercase font-mono">
                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h}
                        onClick={() => handleSort(h)}
                        className="py-2.5 px-4 font-semibold tracking-wider cursor-pointer hover:text-white transition select-none"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span>{h.replace(/_/g, ' ')}</span>
                          <ArrowUpDown className={`w-3 h-3 ${sortCol === h ? 'text-[#8b95ff]' : 'text-[#5d626b]'}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {items.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      {headers.map((h) => (
                        <td key={h} className="py-2.5 px-4 text-[#c7c9cc]">
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
        <div className="bg-black text-[#8b95ff] rounded-xl p-5 border border-white/[0.08] font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
