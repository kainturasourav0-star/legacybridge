'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Run } from '@/types';

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRuns = () => {
    setLoading(true);
    fetch('/api/runs')
      .then((r) => r.json())
      .then((data) => {
        setRuns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const filtered = runs.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.taskId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>IMMUTABLE AUDIT TRAIL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Run Audit History
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Full cryptographic execution records, DOM verification states, delivery receipts, and replay links.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm self-start md:self-auto"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-4 shadow-xl shadow-black/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Run ID or Task ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
          >
            <option value="all">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="validation_failed">Validation Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-400" />
          Loading audit log...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-16 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-base font-bold text-white">No matching audit logs found</p>
          <p className="text-xs text-slate-400">Run automated tasks to populate cryptographic replay logs.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-xl shadow-black/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Run Identifier</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Execution Mode</th>
                  <th className="py-3.5 px-4 font-bold">Validation Score</th>
                  <th className="py-3.5 px-4 font-bold">Delivery</th>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-300">{r.id}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                          r.status === 'succeeded'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : r.status === 'failed' || r.status === 'validation_failed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{r.executionMode}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {r.validationReport ? `${r.validationReport.score}%` : '100%'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 capitalize">{r.deliveryStatus || 'pending'}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(r.startedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/runs/${r.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 transition font-medium"
                      >
                        Console
                      </Link>
                      {r.validatedData && (
                        <Link
                          href={`/runs/${r.id}/results`}
                          className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition shadow-sm"
                        >
                          Results
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
