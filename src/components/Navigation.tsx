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
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Task Library', href: '/tasks', icon: Layers },
  { label: 'Task Builder', href: '/tasks/new', icon: PlusCircle },
  { label: 'Run Console', href: '/runs', icon: PlayCircle },
  { label: 'Audit History', href: '/history', icon: History },
  { label: 'Integrations & Vault', href: '/settings', icon: Sliders },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header (Visible on screens < md) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-950 border-b border-navy-800 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center font-bold text-white shadow-sm text-sm">
            LB
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm tracking-tight leading-none">LegacyBridge</h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">HackIIITD 2026</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-auto w-64 bg-navy-950 text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-navy-800 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-navy-800 hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center font-bold text-white shadow-md">
                LB
              </div>
              <div>
                <h1 className="font-semibold tracking-tight text-white text-base">LegacyBridge</h1>
                <p className="text-xs text-slate-400 font-mono">HackIIITD 2026</p>
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal/20 text-mint border border-teal/40">
                <span className="w-1.5 h-1.5 rounded-full bg-mint mr-1.5 animate-pulse"></span>
                TinyFish Ready
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-navy-800 text-slate-300">
                Demo Active
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 mt-16 md:mt-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Legacy ERP Quick Link */}
        <div className="p-4 border-t border-navy-800 bg-navy-900/60">
          <div className="text-xs text-slate-400 mb-2 font-medium">DEMO TARGET PORTAL</div>
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-md bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs transition-colors border border-navy-700"
          >
            <span className="flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-amber" />
              <span>Acme ERP v4.2 (:8080)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <div className="mt-3 text-[11px] text-slate-400 leading-tight">
            Trust Pillars: <span className="text-slate-200 font-semibold">VALIDATE</span> · <span className="text-slate-200 font-semibold">APPROVE</span> · <span className="text-slate-200 font-semibold">AUDIT</span>
          </div>
        </div>
      </aside>
    </>
  );
}
