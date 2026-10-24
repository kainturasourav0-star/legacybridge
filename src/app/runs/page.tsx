'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { Run } from '@/types';

export default function RunsListPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/runs')
      .then((r) => r.json())
      .then((data) => {
        setRuns(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-ink">Active Run Consoles</h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor browser automation timelines, execution steps, and live TinyFish replay links.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading runs...</div>
      ) : runs.length === 0 ? (
        <div className="bg-surface rounded-card border border-slate-200/80 p-12 text-center space-y-3">
          <Clock className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">No active runs found</p>
          <Link href="/tasks/new" className="text-xs text-teal font-medium hover:underline">
            Launch your first task run &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-slate-200/80 divide-y divide-slate-100 shadow-subtle overflow-hidden">
          {runs.map((r) => (
            <div key={r.id} className="p-5 flex items-center justify-between hover:bg-slate-50/60 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold text-ink">{r.id}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      r.status === 'succeeded'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : r.status === 'failed' || r.status === 'validation_failed'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-dark border border-amber/40'
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{r.executionMode}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Started: {new Date(r.startedAt).toLocaleString()} · Delivery: {r.deliveryStatus || 'pending'}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/runs/${r.id}`}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-white text-xs font-medium text-slate-700 transition"
                >
                  Open Console
                </Link>
                {r.validatedData && (
                  <Link
                    href={`/runs/${r.id}/results`}
                    className="px-3.5 py-2 rounded-lg bg-teal text-white hover:bg-teal-700 text-xs font-medium transition"
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
