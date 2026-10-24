import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Sparkles, Terminal, Users, Cpu, Layers3 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About LegacyBridge — Our Mission & Story',
  description: 'Bridging the gap between legacy enterprise software and modern intelligence without high-risk rewrites.',
};

export default function AboutPage() {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OUR ORIGIN & PHILOSOPHY</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#f7f8f8] tracking-tight">
          Safe, Intelligent Evolution for Legacy Software
        </h1>
        <p className="text-base md:text-lg text-[#8a8f98] leading-relaxed font-normal">
          80% of enterprise IT budgets are consumed maintaining decades-old software. When organizations attempt massive rewrites, over 70% fail, collapse under budget overruns, or lose critical implicit business logic. We built LegacyBridge to change that.
        </p>
      </div>

      {/* The Core Problem & Our Approach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-[#e05252]/20 space-y-4">
          <div className="text-[10px] font-mono text-[#e05252] uppercase font-bold tracking-wider">
            THE LEGACY DILEMMA
          </div>
          <h2 className="text-2xl font-semibold text-[#f7f8f8]">
            Too Critical to Touch. Too Brittle to Evolve.
          </h2>
          <p className="text-sm text-[#8a8f98] leading-relaxed">
            Over years of production patches, core underwriting formulas, volume tier rules, and regulatory validations become undocumented tribal knowledge. The original authors have moved on, leaving behind tightly coupled monoliths that engineers fear to modify.
          </p>
          <ul className="space-y-2.5 text-xs text-[#c7c9cc] pt-2">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05252]" />
              <span>Multi-million dollar blind rewrite failures</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05252]" />
              <span>Undocumented business rules lost in migration</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05252]" />
              <span>Cascading failures between tightly coupled modules</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-[#4daf73]/20 space-y-4">
          <div className="text-[10px] font-mono text-[#4daf73] uppercase font-bold tracking-wider">
            THE LEGACYBRIDGE SOLUTION
          </div>
          <h2 className="text-2xl font-semibold text-[#f7f8f8]">
            Automated Intelligence & Low-Risk Strangler Evolution
          </h2>
          <p className="text-sm text-[#8a8f98] leading-relaxed">
            LegacyBridge connects directly to your codebase and running portals. It parses ASTs, recovers implicit business logic, generates microservice scaffolds, and runs automated regression tests that catch logic drift before deployment.
          </p>
          <ul className="space-y-2.5 text-xs text-[#c7c9cc] pt-2">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#4daf73] shrink-0" />
              <span>Incremental Strangler Fig migration with rollback criteria</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#4daf73] shrink-0" />
              <span>Reverse regression suites verifying business rule parity</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#4daf73] shrink-0" />
              <span>Instant REST API feeds generated from un-API&apos;d legacy portals</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Leadership & Architectural Team */}
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-mono text-[#8b95ff] uppercase font-bold tracking-wider">
            ENGINEERING EXCELLENCE
          </div>
          <h2 className="text-2xl font-semibold text-[#f7f8f8] mt-1">
            Built by Architects for Mission-Critical Systems
          </h2>
          <p className="text-xs text-[#8a8f98] mt-1">
            Our engineering team combines decades of experience in distributed systems, application security, and AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <Cpu className="w-6 h-6 text-[#8b95ff]" />
            <h3 className="text-sm font-semibold text-[#f7f8f8]">Deterministic AST Parsing</h3>
            <p className="text-xs text-[#8a8f98]">
              We never guess or hallucinate code structure; every edge, table, and function is verified against concrete language grammars.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <Shield className="w-6 h-6 text-[#4daf73]" />
            <h3 className="text-sm font-semibold text-[#f7f8f8]">OWASP & Zero-Trust Core</h3>
            <p className="text-xs text-[#8a8f98]">
              Row-Level Security, strict SSRF blocks, masked audit logging, and cryptographic webhook signatures protect your enterprise data.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <Terminal className="w-6 h-6 text-[#e0a82e]" />
            <h3 className="text-sm font-semibold text-[#f7f8f8]">TinyFish Browser Agents</h3>
            <p className="text-xs text-[#8a8f98]">
              Autonomous cloud browsers navigate complex multi-step ERP screens, handling dynamic session state and generating live data feeds.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-white/[0.04] to-[#5e6ad2]/10 border border-white/[0.12] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-semibold text-[#f7f8f8]">Ready to inspect your legacy systems?</h3>
          <p className="text-xs text-[#8a8f98] mt-1">
            Explore our live interactive dashboard or run your first regression drift audit in seconds.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 shadow-sm"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/pricing"
            className="px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white font-medium text-xs transition"
          >
            <span>View Pricing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
