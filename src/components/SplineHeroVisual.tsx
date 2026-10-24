'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Server,
  Cpu,
  ShieldCheck,
  Send,
  Zap,
  Globe,
  Database,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export function SplineHeroVisual() {
  const shouldReduceMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nodes = [
    {
      id: 0,
      title: 'Legacy ERP',
      subtitle: '2004 Frameset Portal',
      meta: ':8080 · No API',
      icon: Server,
      color: 'from-amber-500/20 to-amber-700/30 text-amber-300 border-amber-500/40',
      badge: 'SOURCE',
    },
    {
      id: 1,
      title: 'TinyFish Agent',
      subtitle: 'DOM Traversal & Auth',
      meta: 'Cloud Headless Browser',
      icon: Cpu,
      color: 'from-teal-500/20 to-teal-700/30 text-teal-300 border-teal-500/40',
      badge: 'AUTOMATE',
    },
    {
      id: 2,
      title: 'Trust Engine',
      subtitle: 'Invariants & Null Rate',
      meta: 'Pydantic / Zod <5% nulls',
      icon: ShieldCheck,
      color: 'from-blue-500/20 to-blue-700/30 text-blue-300 border-blue-500/40',
      badge: 'VALIDATE',
    },
    {
      id: 3,
      title: 'Instant Feed & Ops',
      subtitle: 'Live REST & Slack',
      meta: 'GET /api/feeds/:id/latest',
      icon: Send,
      color: 'from-emerald-500/20 to-emerald-700/30 text-emerald-300 border-emerald-500/40',
      badge: 'DELIVER',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border border-navy-800 p-6 md:p-8 shadow-card text-white">
      {/* Background Glow / Mesh grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(79, 224, 200, 0.15) 0%, transparent 60%),
                            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal/20 border border-teal/40 text-mint text-xs font-mono font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span>ARCHITECTURE INTERACTION</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
            How LegacyBridge Transforms Fragile Web Portals
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
            Hover over any pipeline node to inspect real telemetry, validation constraints, and live data transit.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-1 rounded bg-navy-800 border border-navy-700 text-slate-300">
            Three Trust Pillars: Active
          </span>
        </div>
      </div>

      {/* Interactive 4-Node Pipeline Visual */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = activeNode === node.id;
          return (
            <motion.div
              key={node.id}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-xl p-4 border transition-all cursor-pointer backdrop-blur-md ${
                isSelected
                  ? 'bg-navy-800/90 border-teal shadow-lg shadow-teal/10'
                  : 'bg-navy-900/60 border-navy-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-navy-950/80 border border-slate-700 text-slate-300 uppercase">
                  {node.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Step 0{index + 1}</span>
              </div>

              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${node.color} border flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">{node.title}</h3>
                  <p className="text-[11px] text-slate-300">{node.subtitle}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-navy-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{node.meta}</span>
                <Zap className={`w-3 h-3 ${isSelected ? 'text-mint' : 'text-slate-500'}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Telemetry Sub-Panel */}
      <div className="relative z-10 mt-6 pt-4 border-t border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-teal shrink-0" />
          <span>
            {activeNode === 0 && 'Target: Acme Inventory v4.2 ERP running on localhost:8080 with session cookies & pagination.'}
            {activeNode === 1 && 'Agent: TinyFish operates headless browser to navigate menus, bypass outdated framesets, and extract records.'}
            {activeNode === 2 && 'Invariants: Pydantic & Zod evaluate schema adherence, null rate (<5%), and historical drift (<25%).'}
            {activeNode === 3 && 'Deliveries: Validated rows trigger instant REST API feed updates and Slack channel broadcasts.'}
            {activeNode === null && 'Continuous self-healing browser automation with mathematical schema guarantees.'}
          </span>
        </div>
        <div className="flex items-center space-x-4 shrink-0 font-mono text-[11px]">
          <span className="text-slate-400">STATUS: <strong className="text-emerald-400">ONLINE</strong></span>
          <span className="text-slate-400">LATENCY: <strong className="text-slate-200">142ms</strong></span>
        </div>
      </div>
    </div>
  );
}
