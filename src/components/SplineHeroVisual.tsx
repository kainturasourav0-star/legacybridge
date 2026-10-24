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
  Activity
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
      title: 'Legacy ERP Portal',
      subtitle: '2004 Frameset Architecture',
      meta: ':8080 · Zero Native API',
      icon: Server,
      color: 'from-amber-500/20 to-amber-700/30 text-amber-300 border-amber-500/40',
      badge: 'SOURCE',
    },
    {
      id: 1,
      title: 'TinyFish Cloud Agent',
      subtitle: 'DOM Traversal & Session Auth',
      meta: 'Headless Chromium Engine',
      icon: Cpu,
      color: 'from-teal-500/20 to-teal-700/30 text-teal-300 border-teal-500/40',
      badge: 'AUTOMATE',
    },
    {
      id: 2,
      title: 'Trust & Invariants',
      subtitle: 'Strict Null & Schema Bounds',
      meta: 'Pydantic / Zod <5% nulls',
      icon: ShieldCheck,
      color: 'from-blue-500/20 to-blue-700/30 text-blue-300 border-blue-500/40',
      badge: 'VALIDATE',
    },
    {
      id: 3,
      title: 'Instant Feed & Webhooks',
      subtitle: 'Live REST & Slack Delivery',
      meta: 'GET /api/feeds/:id/latest',
      icon: Send,
      color: 'from-emerald-500/20 to-emerald-700/30 text-emerald-300 border-emerald-500/40',
      badge: 'DELIVER',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 p-6 md:p-8 shadow-2xl shadow-black/40 text-white">
      {/* Background Glow / Mesh grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(20, 184, 166, 0.18) 0%, transparent 60%),
                            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-medium mb-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>INTERACTIVE PIPELINE ARCHITECTURE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white tracking-tight">
            How LegacyBridge Transforms Fragile Web Systems
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
            Hover over any pipeline node to inspect real telemetry, invariant thresholds, and cryptographic delivery states.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 font-semibold flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Three Trust Pillars: ACTIVE</span>
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
                  ? 'bg-slate-800/90 border-teal-500 shadow-xl shadow-teal-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-300 uppercase">
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

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{node.meta}</span>
                <Zap className={`w-3 h-3 ${isSelected ? 'text-teal-300' : 'text-slate-500'}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Telemetry Sub-Panel */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-teal-400 shrink-0" />
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
