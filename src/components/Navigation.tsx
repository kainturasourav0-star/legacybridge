'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers3,
  Play,
  Radio,
  History,
  KeyRound,
  ExternalLink,
  Menu,
  X,
  Plus,
  Sparkles,
  Database,
  Link2,
  FolderGit2,
  Code2,
  Network,
  ScrollText,
  GitFork,
  SplitSquareVertical,
  CheckCheck,
  Search,
  ShieldAlert,
  FileText,
  Compass,
  Boxes,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

const isClerkEnabled = typeof window !== 'undefined'
  ? !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder')
  : !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function BridgeMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M11 6H7.5A1.5 1.5 0 0 0 6 7.5v17A1.5 1.5 0 0 0 7.5 26H11M21 6h3.5A1.5 1.5 0 0 1 26 7.5v17a1.5 1.5 0 0 1-1.5 1.5H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M11 11h10M11 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="11" r="2" fill="currentColor" />
      <circle cx="16" cy="21" r="2" fill="currentColor" />
    </svg>
  );
}

const MODERNIZATION_NAV = [
  { label: 'Overview', href: '/dashboard', icon: Layers3 },
  { label: 'Projects', href: '/projects', icon: FolderGit2 },
  { label: 'Code Analysis', href: '/analysis', icon: Code2 },
  { label: 'Business Logic', href: '/business-logic', icon: ScrollText },
  { label: 'Dependency Graph', href: '/architecture', icon: Network },
  { label: 'Architecture Advisor', href: '/advisor', icon: Compass },
  { label: 'Migration Planner', href: '/migration', icon: GitFork },
  { label: 'Migration Safety Twin', href: '/safety-twin', icon: Boxes, badge: 'TWIN', highlight: true },
  { label: 'Drift Detector', href: '/drift', icon: SplitSquareVertical, badge: 'DRIFT', highlight: true },
  { label: 'Confidence Gate', href: '/confidence-gate', icon: Lock, badge: 'GATE' },
  { label: 'Validation & Tests', href: '/validation', icon: CheckCheck },
  { label: 'Continuous Guard', href: '/continuous-guard', icon: ShieldCheck },
  { label: 'Migration Research', href: '/research', icon: Search, badge: 'TinyFish', tinyfish: true },
  { label: 'Security Findings', href: '/security', icon: ShieldAlert },
  { label: 'Reports & Audits', href: '/reports', icon: FileText },
];

const FEED_NAV = [
  { label: 'Task Library', href: '/tasks', icon: Play, badge: '12' },
  { label: 'Run Consoles', href: '/runs', icon: Radio },
  { label: 'Audit Trail', href: '/history', icon: History },
  { label: 'Vault & Settings', href: '/settings', icon: KeyRound },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Landing page renders edge-to-edge with its own floating glass navigation
  const isLandingPage = pathname === '/' || pathname === '/landing';
  if (isLandingPage) {
    return null;
  }

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#090a0c]/95 border-b border-white/[0.08] z-50 px-4 flex items-center justify-between backdrop-blur-xl">
        <Link href="/" className="flex items-center space-x-2.5">
          <span className="text-[#8b95ff]">
            <BridgeMark size={22} />
          </span>
          <span className="font-semibold text-[#f7f8f8] text-sm tracking-tight">LegacyBridge</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8b95ff] border border-white/[0.08]">
            v2.0
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8a8f98] hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Spacer for non-landing pages on mobile */}
      <div className="md:hidden h-16 w-full shrink-0" aria-hidden="true" />

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-md transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Axis-matched Glassmorphic Sidebar */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-auto w-64 bg-[#090a0c]/98 text-[#f7f8f8] flex flex-col justify-between shrink-0 min-h-screen border-r border-white/[0.08] backdrop-blur-2xl transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/[0.07] hidden md:block">
            <Link href="/" className="flex items-center justify-between group">
              <div className="flex items-center space-x-2.5">
                <span className="text-[#8b95ff] group-hover:scale-105 transition-transform">
                  <BridgeMark size={24} />
                </span>
                <span className="font-semibold text-[#f7f8f8] text-sm tracking-tight">
                  LegacyBridge
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#5e6ad2]/15 text-[#8b95ff] border border-[#5e6ad2]/25">
                LIVE
              </span>
            </Link>

            {/* System Status Pill */}
            <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-md bg-white/[0.025] border border-white/[0.06] text-[11px]">
              <span className="flex items-center space-x-2 text-[#8a8f98]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73] shadow-[0_0_8px_rgba(77,175,115,0.4)]" />
                <span>All systems normal</span>
              </span>
              <span className="text-[10px] font-mono text-[#5d626b]">
                4 targets
              </span>
            </div>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="p-3 space-y-4 mt-14 md:mt-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {/* Modernization & AI Intelligence Section */}
            <div>
              <div className="px-3 py-1 text-[9px] font-mono font-semibold tracking-[0.14em] text-[#5d626b] uppercase">
                Modernization & AI
              </div>
              <div className="space-y-0.5 mt-1">
                {MODERNIZATION_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#5e6ad2]/15 text-[#f7f8f8] border border-[#5e6ad2]/30 shadow-sm'
                          : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#8b95ff]' : 'text-[#5d626b]'}`} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border shrink-0 ${
                            item.highlight
                              ? 'bg-[#e05252]/15 text-[#e05252] border-[#e05252]/30'
                              : item.tinyfish
                              ? 'bg-[#5e6ad2]/15 text-[#8b95ff] border-[#5e6ad2]/30'
                              : 'bg-white/[0.04] text-[#8a8f98] border-white/[0.08]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Feeds & Execution Section */}
            <div>
              <div className="px-3 py-1 text-[9px] font-mono font-semibold tracking-[0.14em] text-[#5d626b] uppercase">
                Feeds & Delivery
              </div>
              <div className="space-y-0.5 mt-1">
                {FEED_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/settings');
                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#5e6ad2]/15 text-[#f7f8f8] border border-[#5e6ad2]/30 shadow-sm'
                          : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#8b95ff]' : 'text-[#5d626b]'}`} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-mono text-[#5d626b] px-1.5 py-0.2 rounded bg-white/[0.04]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/[0.07] bg-[#0a0a0a]/60 space-y-2">
          {/* Instant API Feed Quick Link */}
          <a
            href="/api/feeds/task-q3-sales-acme/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-md bg-white/[0.025] hover:bg-white/[0.06] text-[#8a8f98] hover:text-[#f7f8f8] text-xs transition border border-white/[0.06] group"
          >
            <span className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-[#8b95ff]" />
              <span className="font-mono text-[11px]">/api/feeds/latest</span>
            </span>
            <ExternalLink className="w-3 h-3 text-[#5d626b] group-hover:text-[#8b95ff] transition" />
          </a>

          {/* Legacy ERP Target */}
          <div className="rounded-md p-2.5 bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-[#5d626b] uppercase tracking-wider">Demo ERP Target</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0a82e] animate-pulse" />
            </div>
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-xs text-[#8a8f98] hover:text-white transition group"
            >
              <span>Acme ERP (:8080)</span>
              <ExternalLink className="w-3 h-3 text-[#5d626b] group-hover:text-[#8b95ff] transition" />
            </a>
          </div>

          {/* Clerk Identity / Session Status */}
          <div className="rounded-md p-2 bg-white/[0.02] border border-white/[0.06]">
            {isClerkEnabled ? (
              <>
                <SignedIn>
                  <div className="flex items-center justify-between text-xs text-[#8a8f98]">
                    <div className="flex items-center space-x-2 truncate">
                      <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-6 h-6' } }} />
                      <span className="truncate text-[11px] font-mono text-[#c7c9cc]">Architect Mode</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#4daf73] px-1 bg-[#4daf73]/10 border border-[#4daf73]/20 rounded">Clerk</span>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-[#8a8f98] font-mono">Guest</span>
                    <SignInButton mode="modal">
                      <button className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#5e6ad2]/20 text-[#b5bcff] border border-[#5e6ad2]/40 hover:bg-[#5e6ad2]/30 transition">
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </>
            ) : (
              <div className="flex items-center justify-between text-xs text-[#8a8f98]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73]" />
                  <span className="text-[11px] font-mono text-[#c7c9cc]">Demo Lead</span>
                </div>
                <span className="text-[9px] font-mono text-[#5d626b] px-1 bg-white/[0.04] rounded">Local</span>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="block text-center text-[10px] text-[#5d626b] hover:text-[#8a8f98] transition font-mono pt-1"
          >
            ← Back to Product Overview
          </Link>
        </div>
      </aside>
    </>
  );
}
