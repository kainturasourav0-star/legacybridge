'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  GitFork,
  Boxes,
  Database,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Network,
  RefreshCw,
} from 'lucide-react';
import { ServiceBoundaryRecommendation } from '@/types';

export default function BoundaryAdvisorPage() {
  const [recommendations, setRecommendations] = useState<ServiceBoundaryRecommendation[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdvisorData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/advisor');
      const json = await res.json();
      setRecommendations(json.recommendations || []);
      setSummary(json.executiveSummary || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8b95ff]/15 border border-[#8b95ff]/30 text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>SMART SERVICE BOUNDARY ADVISOR · ARCHITECTURAL GUIDANCE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Service Boundary Advisor
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl leading-relaxed">
            Evaluates module cohesion, dependency coupling, shared database tables, and transaction boundaries. Explicitly recommends an in-process Modular Monolith interim when premature microservices carry high distributed transaction risk.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/migration"
            className="px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 shadow-sm"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>View Migration Plan</span>
          </Link>
        </div>
      </div>

      {/* Interim Modular Monolith Recommendation Card */}
      <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#8b95ff]/30 space-y-3 relative overflow-hidden">
        <div className="flex items-center space-x-2 text-[#8b95ff]">
          <Boxes className="w-5 h-5" />
          <h2 className="text-base font-semibold text-[#f7f8f8]">
            Architectural Principle: Safe Decomposition vs Premature Microservices
          </h2>
        </div>
        <p className="text-xs md:text-sm text-[#c7c9cc] leading-relaxed">
          {summary ||
            'Do not divide every module into a microservice. Where synchronous shared transactions exist between Orders and Inventory, LegacyBridge advises an interim Modular Monolith boundary until asynchronous domain events are stabilized.'}
        </p>
      </div>

      {/* Module Assessment Cards */}
      <div className="space-y-4">
        <div className="text-xs font-mono font-bold text-[#8a8f98] uppercase tracking-wider px-1">
          Candidate Service Boundaries ({recommendations.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl bg-[#0a0a0a] border transition space-y-4 ${
                rec.recommendedArchitecture === 'modular_monolith_interim'
                  ? 'border-[#e0a82e]/40 shadow-sm'
                  : 'border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-[#5d626b] uppercase">MODULE BOUNDARY</span>
                  <h3 className="text-sm font-semibold text-[#f7f8f8] mt-0.5">{rec.moduleName}</h3>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 border ${
                    rec.recommendedArchitecture === 'modular_monolith_interim'
                      ? 'bg-[#e0a82e]/15 text-[#e0a82e] border-[#e0a82e]/30'
                      : 'bg-[#4daf73]/15 text-[#4daf73] border-[#4daf73]/30'
                  }`}
                >
                  {rec.recommendedArchitecture === 'modular_monolith_interim'
                    ? 'Modular Monolith (Interim)'
                    : 'Microservice Candidate'}
                </span>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/60 border border-white/[0.04] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#5d626b] block">Coupling</span>
                  <strong className={rec.couplingScore > 0.5 ? 'text-[#e05252]' : 'text-[#4daf73]'}>
                    {(rec.couplingScore * 100).toFixed(0)}%
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5d626b] block">Cohesion</span>
                  <strong className="text-[#8b95ff]">{(rec.cohesionScore * 100).toFixed(0)}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5d626b] block">Tx Model</span>
                  <strong className="text-[#c7c9cc] text-[10px]">
                    {rec.transactionComplexity === 'distributed_saga_required' ? 'Saga Req.' : 'In-Process'}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-[#8a8f98] leading-relaxed">
                <strong className="text-[#c7c9cc]">Rationale:</strong> {rec.rationale}
              </p>

              {/* Prerequisites */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                <div className="text-[10px] font-mono text-[#5d626b] uppercase">Migration Prerequisites:</div>
                <ul className="space-y-1 text-xs text-[#8a8f98]">
                  {rec.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className="w-1 h-1 rounded-full bg-[#8b95ff]" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
