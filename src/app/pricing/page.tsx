import Link from 'next/link';
import { Check, ShieldCheck, Zap, ArrowRight, CreditCard, Lock, Sparkles, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Enterprise Plans — LegacyBridge',
  description: 'Predictable pricing for legacy software intelligence, logic drift detection, and automated microservice migration.',
};

export default function PricingPage() {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRANSPARENT ENTERPRISE TIERS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#f7f8f8] tracking-tight">
          Modernize with Zero Guesswork
        </h1>
        <p className="text-sm md:text-base text-[#8a8f98] leading-relaxed">
          Predictable subscription plans backed by our 30-Day Money-Back Guarantee and 99.9% Uptime Service Level Agreement.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Starter */}
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] flex flex-col justify-between space-y-6 hover:border-white/[0.18] transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8a8f98] uppercase">Starter</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#8a8f98]">
                For Small Teams
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-semibold text-[#f7f8f8]">$499</span>
                <span className="text-xs text-[#8a8f98] font-mono">/month</span>
              </div>
              <p className="text-xs text-[#8a8f98] mt-1">Billed annually or $599 monthly</p>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Ideal for single monolithic applications seeking automated AST mapping and logic recovery.
            </p>

            <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-[#c7c9cc]">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Up to 50,000 Lines of Code</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>AST Dependency Graph & Coupling Map</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Business Rule Extraction (Up to 50 rules)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>5 TinyFish Browser Feeds</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Community & Email Support</span>
              </div>
            </div>
          </div>

          <Link
            href="/thank-you?tier=starter"
            className="w-full py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#f7f8f8] font-semibold text-xs transition text-center"
          >
            Get Started
          </Link>
        </div>

        {/* Tier 2: Professional (Popular) */}
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#8b95ff]/50 shadow-[0_0_30px_rgba(139,149,255,0.12)] flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#8b95ff] text-[#08090a] font-mono text-[10px] font-bold uppercase tracking-wider">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8b95ff] uppercase font-bold">Professional</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8b95ff]/15 text-[#8b95ff] border border-[#8b95ff]/30">
                Flagship Suite
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-semibold text-[#f7f8f8]">$1,499</span>
                <span className="text-xs text-[#8a8f98] font-mono">/month</span>
              </div>
              <p className="text-xs text-[#8a8f98] mt-1">Billed annually or $1,799 monthly</p>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Complete migration intelligence suite with live logic drift regression and scaffold generation.
            </p>

            <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-[#c7c9cc]">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span className="font-semibold text-white">Up to 250,000 Lines of Code</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span className="font-semibold text-[#8b95ff]">Flagship Logic Drift Regression Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Microservice Scaffold Generator (FastAPI / Node)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Strangler Fig Migration Planner with Rollback Triggers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>25 Automated TinyFish Browser Feeds</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Priority 4-hour SLA Support</span>
              </div>
            </div>
          </div>

          <Link
            href="/thank-you?tier=professional"
            className="w-full py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition text-center shadow-md active:scale-95"
          >
            Start Free 14-Day Trial
          </Link>
        </div>

        {/* Tier 3: Enterprise */}
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] flex flex-col justify-between space-y-6 hover:border-white/[0.18] transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8a8f98] uppercase">Enterprise</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#8a8f98]">
                Custom Scale
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-semibold text-[#f7f8f8]">Custom</span>
              </div>
              <p className="text-xs text-[#8a8f98] mt-1">Dedicated VPC or On-Premise Airgap</p>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Designed for banks, healthcare systems, and Fortune 500 enterprises with stringent compliance requirements.
            </p>

            <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-[#c7c9cc]">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Unlimited Lines of Code & Monoliths</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Dedicated Single-Tenant Instance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>Custom AST Language Parsers (COBOL, RPG, Java)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>SOC2 Type II & HIPAA Compliance Documentation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#4daf73] shrink-0" />
                <span>24/7 Dedicated Solutions Architect & 99.99% SLA</span>
              </div>
            </div>
          </div>

          <Link
            href="/thank-you?tier=enterprise"
            className="w-full py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#f7f8f8] font-semibold text-xs transition text-center"
          >
            Contact Enterprise Sales
          </Link>
        </div>
      </div>

      {/* Trust, Guarantee & Payment Methods Banner */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-[#4daf73] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#f7f8f8]">30-Day Money-Back Guarantee</h4>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              If LegacyBridge does not recover your business rules and identify logic drift accurately, receive a 100% full refund with zero questions asked.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Lock className="w-6 h-6 text-[#8b95ff] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Secure Encrypted Billing</h4>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              All payment transactions are processed with 256-bit AES encryption via Stripe. No raw card numbers or CVVs touch our servers.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <CreditCard className="w-6 h-6 text-[#e0a82e] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#f7f8f8]">Accepted Payment Methods</h4>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Visa, Mastercard, American Express, Discover, SEPA Debit, Wire Transfers, and Net-30 Enterprise Purchase Orders (PO).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
