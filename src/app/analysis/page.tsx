'use client';

import { useState, useEffect } from 'react';
import {
  Code2,
  FileCode,
  FolderTree,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers3,
  Search,
} from 'lucide-react';
import { SAMPLE_MONOLITH_PROJECT, SAMPLE_MODULES, SAMPLE_FINDINGS } from '@/fixtures/legacy_monolith';

export default function CodeAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'database' | 'files'>('modules');

  const filesInventory = [
    { path: 'src/orders_monolith.js', size: '14.2 KB', loc: 380, lang: 'JavaScript', role: 'Main Controller & Pipeline' },
    { path: 'src/customers.js', size: '8.4 KB', loc: 240, lang: 'JavaScript', role: 'Customer Risk & Credit Scoring' },
    { path: 'src/inventory.js', size: '10.1 KB', loc: 310, lang: 'JavaScript', role: 'Warehouse Stock Manager' },
    { path: 'src/pricing_engine.js', size: '6.5 KB', loc: 190, lang: 'JavaScript', role: 'Tiered Discount Engine' },
    { path: 'src/database/connection.js', size: '3.2 KB', loc: 85, lang: 'JavaScript', role: 'PostgreSQL Knex Client' },
    { path: 'src/database/queries.js', size: '7.8 KB', loc: 210, lang: 'JavaScript', role: 'Raw SQL Query Wrappers' },
    { path: 'tests/monolith.test.js', size: '5.1 KB', loc: 145, lang: 'JavaScript', role: 'Legacy Regression Test Suite' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>STATIC CODE INTELLIGENCE & AST INSPECTOR</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Code Analysis Explorer
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Deterministic file inventory, AST module relationships, raw SQL query mapping, and architectural metrics for the Acme Enterprise Monolith.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/drift"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#e05252]/15 text-[#e05252] border border-[#e05252]/30 text-xs font-semibold hover:bg-[#e05252]/25 transition"
          >
            <span>Run Drift Detector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'modules' ? 'bg-white/[0.1] text-white' : 'text-[#8a8f98] hover:text-white'
          }`}
        >
          Modules ({SAMPLE_MODULES.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'files' ? 'bg-white/[0.1] text-white' : 'text-[#8a8f98] hover:text-white'
          }`}
        >
          File Inventory ({filesInventory.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'database' ? 'bg-white/[0.1] text-white' : 'text-[#8a8f98] hover:text-white'
          }`}
        >
          Database Tables (4)
        </button>
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_MODULES.map((m) => (
            <div key={m.id} className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8b95ff] uppercase">{m.type}</span>
                <span className="text-[10px] font-mono text-[#5d626b]">{m.linesOfCode} LoC</span>
              </div>
              <h3 className="text-base font-semibold text-[#f7f8f8]">{m.name}</h3>
              <div className="text-xs font-mono text-[#5d626b] truncate">{m.filePath}</div>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8a8f98]">
                <span>Coupling Index: <strong className={m.couplingScore > 0.7 ? 'text-[#e05252]' : 'text-[#4daf73]'}>{m.couplingScore}</strong></span>
                <span className="text-[11px] font-mono text-[#8b95ff]">{m.dependencies.length} deps</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
          {filesInventory.map((f) => (
            <div key={f.path} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <FileCode className="w-4 h-4 text-[#8b95ff]" />
                <div>
                  <span className="text-[#f7f8f8] font-mono font-medium">{f.path}</span>
                  <p className="text-[11px] text-[#8a8f98] mt-0.5">{f.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 font-mono text-[#5d626b]">
                <span>{f.lang}</span>
                <span>{f.loc} lines</span>
                <span>{f.size}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { table: 'customers', cols: ['id (PK)', 'name', 'tier', 'credit_score', 'debt_to_income_ratio', 'balance'], records: '1,420 rows' },
            { table: 'orders', cols: ['id (PK)', 'customer_id (FK)', 'gross_total', 'net_total', 'status', 'created_at'], records: '38,910 rows' },
            { table: 'order_items', cols: ['id (PK)', 'order_id (FK)', 'sku (FK)', 'quantity', 'unit_price', 'line_total'], records: '112,400 rows' },
            { table: 'inventory', cols: ['sku (PK)', 'name', 'stock', 'unit_price', 'safety_threshold'], records: '480 rows' },
          ].map((db) => (
            <div key={db.table} className="p-5 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#8b95ff]">TABLE: {db.table}</span>
                <span className="text-[10px] font-mono text-[#5d626b]">{db.records}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {db.cols.map((col) => (
                  <span key={col} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-[#8a8f98]">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
