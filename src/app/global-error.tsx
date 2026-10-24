'use client';

import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-[#f7f8f8] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center space-y-6">
          <h2 className="text-xl font-semibold text-[#f7f8f8]">System Level Exception</h2>
          <p className="text-xs text-[#8a8f98]">
            An unexpected error occurred at the application boundary.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-lg bg-[#f7f8f8] text-[#08090a] font-semibold text-xs inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
