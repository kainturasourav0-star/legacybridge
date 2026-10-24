'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Clock,
  RefreshCw,
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <History className="w-3.5 h-3.5 text-[#8b95ff]" />
            <span>IMMUTABLE AUDIT TRAIL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Run Audit History
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-2xl font-normal leading-relaxed">
            Full cryptographic execution records, DOM verification states, delivery receipts, and replay links.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition shadow-sm self-start md:self-auto"
          title="Refresh History"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b95ff]' : ''}`} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#5d626b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Run ID or Task ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#5d626b]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#c7c9cc] focus:outline-none focus:border-[#8b95ff] transition"
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
        <div className="py-20 text-center text-xs text-[#8a8f98]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8b95ff]" />
          Loading audit log...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-16 text-center space-y-3">
          <Clock className="w-8 h-8 text-[#5d626b] mx-auto" />
          <p className="text-base font-semibold text-[#f7f8f8]">No matching audit logs found</p>
          <p className="text-xs text-[#8a8f98]">Run automated tasks to populate cryptographic replay logs.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-[#8a8f98] uppercase font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Run Identifier</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Execution Mode</th>
                  <th className="py-3 px-4 font-medium">Validation Score</th>
                  <th className="py-3 px-4 font-medium">Delivery</th>
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#8b95ff]">{r.id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider uppercase border ${
                          r.status === 'succeeded'
                            ? 'bg-[#4daf73]/10 text-[#4daf73] border-[#4daf73]/30'
                            : r.status === 'failed' || r.status === 'validation_failed'
                            ? 'bg-[#e05252]/10 text-[#e05252] border-[#e05252]/30'
                            : 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5d626b] font-mono">{r.executionMode}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#f7f8f8]">
                      {r.validationReport ? `${r.validationReport.score}%` : '100%'}
                    </td>
                    <td className="py-3 px-4 text-[#8a8f98] capitalize">{r.deliveryStatus || 'pending'}</td>
                    <td className="py-3 px-4 text-[#5d626b] font-mono">
                      {new Date(r.startedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/runs/${r.id}`}
                        className="px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#c7c9cc] transition text-xs font-medium"
                      >
                        Console
                      </Link>
                      {r.validatedData && (
                        <Link
                          href={`/runs/${r.id}/results`}
                          className="px-2.5 py-1 rounded-md bg-[#8b95ff] hover:bg-[#b5bcff] text-[#08090a] font-semibold transition text-xs shadow-sm"
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
