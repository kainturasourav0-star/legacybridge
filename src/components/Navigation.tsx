'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  PlayCircle,
  History,
  Sliders,
  ExternalLink,
  Server,
  Menu,
  X,
  ShieldCheck,
  Code2,
  Sparkles,
  Zap,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    heading: 'Core Platform',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Task Library', href: '/tasks', icon: Layers },
      { label: 'Task Builder', href: '/tasks/new', icon: PlusCircle },
      { label: 'Run Console', href: '/runs', icon: PlayCircle },
    ],
  },
  {
    heading: 'Observability & Trust',
    items: [
      { label: 'Audit History', href: '/history', icon: History },
      { label: 'Integrations & Vault', href: '/settings', icon: Sliders },
    ],
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B1120]/95 border-b border-slate-800/80 z-50 px-4 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20 text-sm">
            LB
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm tracking-tight leading-none">LegacyBridge</h1>
            <p className="text-[10px] text-teal-400 font-mono mt-0.5">HackIIITD 2026</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-md transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Modern Glassmorphic Sidebar */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-auto w-64 bg-[#0B1120]/90 text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800/70 backdrop-blur-2xl transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/60 hidden md:block">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                LB
              </div>
              <div>
                <h1 className="font-bold tracking-tight text-white text-base flex items-center gap-1.5">
                  LegacyBridge
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-normal">v1.0</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">Enterprise Automation</p>
              </div>
            </Link>

            {/* System Status Pill */}
            <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
              <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
                </span>
                <span>Engine Active</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                DEMO MODE
              </span>
            </div>
          </div>

          {/* Categorized Nav Groups */}
          <div className="p-4 space-y-6 mt-16 md:mt-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.heading} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                  {group.heading}
                </div>
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-300 border border-teal-500/25 shadow-sm shadow-teal-500/10'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/40 space-y-3">
          {/* Instant API Feed Quick Link */}
          <a
            href="/api/feeds/task-q3-sales-acme/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-300 text-xs transition border border-slate-800 group"
          >
            <span className="flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px]">/api/feeds/latest</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition" />
          </a>

          {/* Legacy ERP Target */}
          <div className="rounded-xl p-3 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Demo ERP Target</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse"></span>
            </div>
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-xs text-slate-200 hover:text-white font-medium group"
            >
              <span className="flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-amber" />
                <span>Acme ERP v4.2 (:8080)</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber transition" />
            </a>
          </div>

          <div className="text-[10px] text-slate-400 text-center font-mono">
            Trust: <span className="text-teal-400 font-semibold">VALIDATE</span> · <span className="text-amber-400 font-semibold">APPROVE</span> · <span className="text-cyan-400 font-semibold">AUDIT</span>
          </div>
        </div>
      </aside>
    </>
  );
}

