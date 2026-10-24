'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Layers3, Play, FolderGit2, Sparkles } from 'lucide-react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier') || 'professional';
  const planName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const orderRef = `LB-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full p-8 md:p-10 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl space-y-8 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#4daf73]/10 border border-[#4daf73]/30 flex items-center justify-center mx-auto text-[#4daf73]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4daf73]/15 text-[#4daf73] border border-[#4daf73]/30 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONFIRMATION · ACCESS GRANTED</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#f7f8f8] tracking-tight">
            Thank You for Joining LegacyBridge
          </h1>
          <p className="text-sm text-[#8a8f98] leading-relaxed max-w-md mx-auto">
            Your enterprise subscription for the <strong className="text-white">{planName} Tier</strong> is active. You now have full access to deterministic AST mapping, logic recovery, and reverse regression suites.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span>REFERENCE ID:</span>
            <span className="text-[#f7f8f8] font-bold">{orderRef}</span>
          </div>
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span>ACTIVATED PLAN:</span>
            <span className="text-[#8b95ff] font-bold">{planName} Edition</span>
          </div>
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span>SLA STATUS:</span>
            <span className="text-[#4daf73] font-bold">99.9% Uptime Guarantee</span>
          </div>
        </div>

        {/* Next Steps Guidance */}
        <div className="space-y-3 text-left">
          <div className="text-[10px] font-mono font-bold text-[#8a8f98] uppercase tracking-wider">
            Recommended Immediate Actions:
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center space-x-3">
              <span className="w-5 h-5 rounded-full bg-[#8b95ff]/15 text-[#8b95ff] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-[#c7c9cc]">Ingest your legacy Git repository or inspect the Acme ERP sample.</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center space-x-3">
              <span className="w-5 h-5 rounded-full bg-[#8b95ff]/15 text-[#8b95ff] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-[#c7c9cc]">Review recovered business rules and inspect AST coupling hotspots.</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center space-x-3">
              <span className="w-5 h-5 rounded-full bg-[#8b95ff]/15 text-[#8b95ff] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-[#c7c9cc]">Execute the Slide 5 stock depletion regression check in the Drift Studio.</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
          >
            <Layers3 className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/projects"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white font-medium text-xs transition flex items-center justify-center space-x-2"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Explore Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#8a8f98]">Loading confirmation...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
