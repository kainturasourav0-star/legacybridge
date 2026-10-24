'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, RefreshCw, Radio } from 'lucide-react';
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Radio className="w-3.5 h-3.5 text-[#8b95ff]" />
            <span>EXECUTION TELEMETRY HUB</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Active Run Consoles
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-2xl font-normal leading-relaxed">
            Monitor browser automation timelines, execution steps, and live TinyFish replay streams.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition shadow-sm self-start md:self-auto"
          title="Refresh Run List"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b95ff]' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#8a8f98]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8b95ff]" />
          Loading active runs...
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-16 text-center space-y-4">
          <Clock className="w-7 h-7 mx-auto text-[#5d626b]" />
          <p className="text-base font-semibold text-[#f7f8f8]">No active runs found</p>
          <p className="text-xs text-[#8a8f98] max-w-sm mx-auto">
            Launch your first automated task run from the studio to stream live execution telemetry.
          </p>
          <div className="pt-2">
            <Link
              href="/tasks/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition"
            >
              <span>Launch First Task Run &rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
          {runs.map((r) => (
            <div
              key={r.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-medium text-[#8b95ff]">{r.id}</span>
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
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#5d626b]">
                    {r.executionMode}
                  </span>
                </div>
                <div className="text-xs text-[#5d626b]">
                  Started: {new Date(r.startedAt).toLocaleString()} · Delivery:{' '}
                  <span className="text-[#8a8f98] font-medium">{r.deliveryStatus || 'pending'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href={`/runs/${r.id}`}
                  className="px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-[#c7c9cc] transition"
                >
                  Open Console
                </Link>
                {r.validatedData && (
                  <Link
                    href={`/runs/${r.id}/results`}
                    className="px-3 py-1.5 rounded-md bg-[#8b95ff] hover:bg-[#b5bcff] text-[#08090a] text-xs font-semibold transition"
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
