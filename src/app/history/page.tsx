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
  RotateCcw
} from 'lucide-react';
import { Run } from '@/types';

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/runs')
      .then((r) => r.json())
      .then((data) => {
        setRuns(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = runs.filter((r) => {
    const matchesSearch = r.id.toLowerCase().includes(search.toLowerCase()) || r.taskId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-teal tracking-wider uppercase mb-1">
          Cryptographic Audit Trail
        </div>
        <h1 className="text-3xl font-serif font-bold text-ink">Run Audit History</h1>
        <p className="text-sm text-slate-600 mt-1">
          Full execution records, DOM verification states, delivery receipts, and replay links.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface rounded-card border border-slate-200/80 p-4 shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Run ID or Task ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
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
        <div className="py-12 text-center text-sm text-slate-500">Loading audit log...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-card border border-slate-200/80 p-12 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching audit logs found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-slate-200/80 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono">
              <tr>
                <th className="py-3 px-4">Run Identifier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Execution Mode</th>
                <th className="py-3 px-4">Validation Score</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-ink">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'succeeded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'failed' || r.status === 'validation_failed'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-dark border border-amber/40'
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">{r.executionMode}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {r.validationReport ? `${r.validationReport.score}%` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{r.deliveryStatus || 'pending'}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {new Date(r.startedAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/runs/${r.id}`}
                      className="px-2.5 py-1 rounded border border-slate-300 hover:bg-white text-slate-700 transition"
                    >
                      Console
                    </Link>
                    {r.validatedData && (
                      <Link
                        href={`/runs/${r.id}/results`}
                        className="px-2.5 py-1 rounded bg-teal text-white hover:bg-teal-700 transition"
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
      )}
    </div>
  );
}
