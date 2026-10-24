'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log masked error safely without leaking raw tokens or DB connection internals
    logger.error('Unhandled client UI exception intercepted by Root Error Boundary', {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#e05252]/10 border border-[#e05252]/20 flex items-center justify-center mx-auto text-[#e05252]">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#e05252]/15 text-[#e05252] text-[10px] font-mono uppercase tracking-wider font-semibold">
            <ShieldAlert className="w-3 h-3" />
            <span>Resilient Failover Triggered</span>
          </div>
          <h2 className="text-xl font-semibold text-[#f7f8f8] tracking-tight">
            Unexpected Service Exception
          </h2>
          <p className="text-xs text-[#8a8f98] leading-relaxed">
            The platform encountered an operational exception. All state has been safely preserved and error details were logged to telemetry.
          </p>
        </div>

        {error.digest && (
          <div className="p-3 rounded-lg bg-black/60 border border-white/[0.04] text-[11px] font-mono text-[#5d626b]">
            Incident Ref: <span className="text-[#8a8f98]">{error.digest}</span>
          </div>
        )}

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 active:scale-95"
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white font-medium text-xs transition flex items-center space-x-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
