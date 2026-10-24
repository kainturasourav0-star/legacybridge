'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, Clock, ExternalLink, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { Run } from '@/types';

export default function RunsListPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>EXECUTION TELEMETRY HUB</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Active Run Consoles
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Monitor browser automation timelines, execution steps, and live TinyFish replay streams.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm self-start md:self-auto"
          title="Refresh Run List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-400" />
          Loading active runs...
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-16 text-center space-y-4 shadow-xl shadow-black/20">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-7 h-7" />
          </div>
          <p className="text-lg font-bold text-white">No active runs found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Launch your first automated task run from the studio to stream live execution telemetry.
          </p>
          <div className="pt-2">
            <Link
              href="/tasks/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-teal-500/20"
            >
              <span>Launch First Task Run &rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 divide-y divide-slate-800/60 shadow-xl shadow-black/20 overflow-hidden">
          {runs.map((r) => (
            <div
              key={r.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-teal-300">{r.id}</span>
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
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
                    {r.executionMode}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Started: {new Date(r.startedAt).toLocaleString()} · Delivery:{' '}
                  <span className="text-slate-300 font-medium">{r.deliveryStatus || 'pending'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 shrink-0">
                <Link
                  href={`/runs/${r.id}`}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                >
                  Open Console
                </Link>
                {r.validatedData && (
                  <Link
                    href={`/runs/${r.id}/results`}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-sm"
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
  );
}
