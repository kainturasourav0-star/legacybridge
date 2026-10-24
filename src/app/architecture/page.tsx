'use client';

import { useState, useEffect } from 'react';
import {
  Network,
  Layers3,
  Database,
  ArrowRight,
  Filter,
  Maximize2,
  Info,
  ShieldCheck,
  GitFork,
  Radio,
} from 'lucide-react';
import { ModuleNode, DependencyEdge, ServiceCandidate } from '@/types';
import { SAMPLE_MODULES, SAMPLE_EDGES, SAMPLE_SERVICE_CANDIDATES } from '@/fixtures/legacy_monolith';

export default function ArchitectureMapPage() {
  const [modules, setModules] = useState<ModuleNode[]>(SAMPLE_MODULES);
  const [edges, setEdges] = useState<DependencyEdge[]>(SAMPLE_EDGES);
  const [candidates, setCandidates] = useState<ServiceCandidate[]>(SAMPLE_SERVICE_CANDIDATES);
  const [selectedNode, setSelectedNode] = useState<ModuleNode | null>(SAMPLE_MODULES[0]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetch('/api/architecture')
      .then((r) => r.json())
      .then((data) => {
        if (data.modules) setModules(data.modules);
        if (data.edges) setEdges(data.edges);
        if (data.candidates) setCandidates(data.candidates);
      })
      .catch((e) => console.error(e));
  }, []);

  const filteredModules = filterType === 'all'
    ? modules
    : modules.filter((m) => m.type === filterType || (filterType === 'cross_boundary' && m.couplingScore > 0.7));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Network className="w-3.5 h-3.5" />
            <span>DEPENDENCY MAPPING & DECOMPOSITION GRAPH</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Interactive Architecture Map
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Deterministic inter-module call graphs, database sharing hot-spots, and automated microservice boundary recommendations based on cohesion and coupling indices.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-4 h-4 text-[#5d626b]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0a0a0a] border border-white/[0.08] text-xs text-[#f7f8f8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#8b95ff]"
          >
            <option value="all">All Architecture Elements</option>
            <option value="controller">Controllers & Routers</option>
            <option value="service">Core Services</option>
            <option value="database">Database Tables</option>
            <option value="cross_boundary">High Coupling Hotspots (&gt; 0.7)</option>
          </select>
        </div>
      </div>

      {/* Main Interactive Map & Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas Area */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] relative min-h-[520px] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#5d626b] pb-4 border-b border-white/[0.06] z-10">
            <span>GRAPH CANVAS · DETERMINISTIC AST RECONSTRUCTION</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8b95ff]" /> Monolith Module</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4daf73]" /> Candidate Boundary</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e0a82e]" /> Shared Database</span>
            </span>
          </div>

          {/* Interactive Graph Node Representation */}
          <div className="relative py-8 flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 place-content-center">
            {filteredModules.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 select-none relative ${
                    isSelected
                      ? 'bg-[#5e6ad2]/20 border-[#8b95ff] shadow-[0_0_20px_rgba(139,149,255,0.2)] scale-[1.02]'
                      : 'bg-[#050505] border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#5d626b] uppercase">{node.type}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        node.couplingScore > 0.75
                          ? 'bg-[#e05252]/15 text-[#e05252]'
                          : 'bg-[#4daf73]/15 text-[#4daf73]'
                      }`}
                    >
                      Coupling: {node.couplingScore}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#f7f8f8]">{node.name}</h4>
                  <div className="text-[11px] font-mono text-[#8a8f98] truncate">{node.filePath}</div>
                  {node.candidateService && (
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#8b95ff]">
                      <span>Boundary:</span>
                      <span className="truncate">{node.candidateService}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#5d626b] font-mono">
            <span>{edges.length} Inter-Module Calls Detected</span>
            <span>Click any node to inspect coupling evidence</span>
          </div>
        </div>

        {/* Right Inspector Drawer */}
        <div className="lg:col-span-4 space-y-6">
          {selectedNode ? (
            <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-5">
              <div>
                <span className="text-[10px] font-mono text-[#8b95ff] uppercase">{selectedNode.type} Node Details</span>
                <h3 className="text-lg font-semibold text-[#f7f8f8] mt-1">{selectedNode.name}</h3>
                <div className="text-xs font-mono text-[#5d626b] mt-1">{selectedNode.filePath}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#050505] border border-white/[0.06]">
                  <span className="text-[#5d626b] block">Lines of Code</span>
                  <span className="text-base font-semibold text-[#f7f8f8] mt-0.5 block">{selectedNode.linesOfCode}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#050505] border border-white/[0.06]">
                  <span className="text-[#5d626b] block">Coupling Index</span>
                  <span className={`text-base font-semibold mt-0.5 block ${selectedNode.couplingScore > 0.7 ? 'text-[#e05252]' : 'text-[#4daf73]'}`}>
                    {selectedNode.couplingScore}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-[#8a8f98] uppercase">Recommended Microservice</div>
                <div className="p-3 rounded-lg bg-white/[0.025] border border-white/[0.08] text-xs text-[#f7f8f8] flex items-center justify-between">
                  <span>{selectedNode.candidateService || 'Shared Utility / Database'}</span>
                  <ShieldCheck className="w-4 h-4 text-[#4daf73]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-[#8a8f98] uppercase">Dependencies ({selectedNode.dependencies.length})</div>
                <div className="space-y-1">
                  {selectedNode.dependencies.map((dep) => (
                    <div key={dep} className="px-3 py-1.5 rounded bg-[#050505] border border-white/[0.06] text-xs font-mono text-[#8a8f98]">
                      &rarr; {dep}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] text-center text-xs text-[#5d626b]">
              Select a module from the canvas to inspect dependencies and coupling evidence.
            </div>
          )}

          {/* Candidate Services Summary */}
          <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
            <div className="text-xs font-mono text-[#8a8f98] uppercase">Candidate Services ({candidates.length})</div>
            <div className="space-y-2">
              {candidates.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-[#050505] border border-white/[0.06] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#f7f8f8]">{c.name}</strong>
                    <span className="text-[10px] font-mono text-[#8b95ff]">Order #{c.migrationOrder}</span>
                  </div>
                  <p className="text-[11px] text-[#8a8f98]">{c.responsibility}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
