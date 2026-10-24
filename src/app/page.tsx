'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Cloud,
  Code2,
  Copy,
  Database,
  Download,
  Factory,
  FileCheck2,
  Fingerprint,
  Fish,
  Globe2,
  Hash,
  KeyRound,
  Layers3,
  Link2,
  ListChecks,
  Loader2,
  LockKeyhole,
  Menu,
  MousePointer2,
  Network,
  Play,
  Radio,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Table2,
  Webhook,
  X,
  Zap,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';

type PresetKey = 'operations' | 'it' | 'saas' | 'manufacturing';

interface PresetData {
  id: PresetKey;
  taskName: string;
  prompt: string;
  destination: string;
  schedule: string;
  resultTitle: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string>>;
  runId: string;
  nonce?: number;
}

const presets: Record<PresetKey, PresetData> = {
  operations: {
    id: 'operations',
    taskName: 'Morning inventory pull',
    prompt: 'Open the inventory portal, pull Q3 sales by region and post the table to #ops-reports.',
    destination: 'Slack',
    schedule: 'Daily at 07:30',
    resultTitle: 'Q3 sales by region',
    columns: [
      { key: 'region', label: 'Region' },
      { key: 'units', label: 'Units' },
      { key: 'change', label: 'vs. Q2' },
    ],
    rows: [
      { region: 'North', units: '1,240', change: '+12.4%' },
      { region: 'South', units: '980', change: '+8.1%' },
      { region: 'West', units: '1,105', change: '+10.7%' },
    ],
    runId: 'LB-2048',
  },
  it: {
    id: 'it',
    taskName: 'Vendor invoice check',
    prompt: 'Sign in to the finance portal, find unpaid vendor invoices due this week and send them to the finance sheet.',
    destination: 'Google Sheets',
    schedule: 'Every Monday at 09:00',
    resultTitle: 'Invoices due this week',
    columns: [
      { key: 'invoice', label: 'Invoice' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'amount', label: 'Amount' },
    ],
    rows: [
      { invoice: 'INV-1048', vendor: 'Apex Freight', amount: '$4,820' },
      { invoice: 'INV-1051', vendor: 'Northstar Co.', amount: '$2,140' },
      { invoice: 'INV-1057', vendor: 'Orion Supplies', amount: '$3,690' },
    ],
    runId: 'LB-2051',
  },
  saas: {
    id: 'saas',
    taskName: 'Customer workspace sync',
    prompt: 'Open the customer admin console, collect active workspaces and seat counts, then send structured data to our webhook.',
    destination: 'Webhook',
    schedule: 'Every 6 hours',
    resultTitle: 'Active customer workspaces',
    columns: [
      { key: 'account', label: 'Account' },
      { key: 'plan', label: 'Plan' },
      { key: 'seats', label: 'Seats' },
    ],
    rows: [
      { account: 'Acme Logistics', plan: 'Business', seats: '48' },
      { account: 'Bright Labs', plan: 'Scale', seats: '126' },
      { account: 'Commonwealth', plan: 'Business', seats: '64' },
    ],
    runId: 'LB-2054',
  },
  manufacturing: {
    id: 'manufacturing',
    taskName: 'Plant 04 stock check',
    prompt: 'Read available stock for Plant 04 from the ERP, compare it with the safety threshold and post the exceptions to SQL.',
    destination: 'PostgreSQL',
    schedule: 'Daily at 06:45',
    resultTitle: 'Plant 04 stock exceptions',
    columns: [
      { key: 'material', label: 'Material' },
      { key: 'available', label: 'Available' },
      { key: 'threshold', label: 'Threshold' },
    ],
    rows: [
      { material: 'AL-204 · Coil', available: '180 kg', threshold: '240 kg' },
      { material: 'BR-118 · Bearing', available: '42 units', threshold: '60 units' },
      { material: 'PK-032 · Resin', available: '95 kg', threshold: '120 kg' },
    ],
    runId: 'LB-2057',
  },
};

const destinationMeta: Record<string, { icon: typeof Hash }> = {
  Slack: { icon: Hash },
  'Google Sheets': { icon: Table2 },
  Webhook: { icon: Webhook },
  PostgreSQL: { icon: Database },
};

const destinationTargets: Record<string, Record<string, string>> = {
  operations: {
    Slack: '#ops-reports',
    'Google Sheets': 'Operations / Q3 sales',
    Webhook: 'ops-data / inventory',
    PostgreSQL: 'ops.q3_sales',
  },
  it: {
    Slack: '#finance-ops',
    'Google Sheets': 'Finance / Invoice monitor',
    Webhook: 'finance-data / invoices',
    PostgreSQL: 'finance.vendor_invoices',
  },
  saas: {
    Slack: '#customer-sync',
    'Google Sheets': 'Customers / Workspace sync',
    Webhook: 'customer-data / workspaces',
    PostgreSQL: 'customers.workspaces',
  },
  manufacturing: {
    Slack: '#plant-04',
    'Google Sheets': 'Plant 04 / Stock exceptions',
    Webhook: 'plant-data / exceptions',
    PostgreSQL: 'ops.inventory_exceptions',
  },
};

const useCases = [
  {
    id: 'operations' as PresetKey,
    label: 'Operations',
    icon: ListChecks,
    eyebrow: 'THE MORNING REPORT, WITHOUT THE MORNING ROUTINE',
    title: 'Start the shift with answers, not another export.',
    description: 'Turn repetitive portal checks into scheduled feeds that arrive in Slack or Sheets before your team asks for them.',
    before: 'Someone opens the ERP, copies figures and rebuilds the same spreadsheet every morning.',
    after: 'A validated report lands in the team channel on schedule, with a complete run trail.',
  },
  {
    id: 'it' as PresetKey,
    label: 'IT & integration',
    icon: Network,
    eyebrow: 'INTEGRATE WITHOUT ANOTHER CUSTOM CONNECTOR',
    title: 'Give every old system a modern interface.',
    description: 'Describe the outcome once instead of scoping months of API work or maintaining another fragile browser script.',
    before: 'Every portal becomes a new integration project, with selectors and edge cases to maintain.',
    after: 'One plain-English task creates a repeatable, schema-checked data flow.',
  },
  {
    id: 'saas' as PresetKey,
    label: 'B2B SaaS',
    icon: Layers3,
    eyebrow: 'MEET CUSTOMERS INSIDE THEIR EXISTING STACK',
    title: 'Connect to your customer’s systems on day one.',
    description: 'Reach customer portals that were never designed for integration, without putting a bespoke connector on your roadmap.',
    before: 'Each customer’s legacy tool creates another engineering workstream and delays onboarding.',
    after: 'Customer data reaches your product as clean JSON through a controlled browser agent.',
  },
  {
    id: 'manufacturing' as PresetKey,
    label: 'Manufacturing',
    icon: Factory,
    eyebrow: 'THE ERP CAN STAY. THE COPY-PASTE CAN GO.',
    title: 'Make critical operational data move at modern speed.',
    description: 'Pull stock, production and procurement data from the screens your plant already trusts, then route it to the tools that need it.',
    before: 'Stock exceptions wait for someone to notice them inside a fifteen-year-old interface.',
    after: 'The right rows are extracted, validated and written to your operational database automatically.',
  },
];

function BridgeMark({ size = 28 }: { size?: number }) {
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

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="brand" href="#top" onClick={close} aria-label="LegacyBridge home">
          <span className="brand-mark">
            <BridgeMark />
          </span>
          <span>LegacyBridge</span>
        </a>

        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Reliability</a>
          <a href="#use-cases">Use cases</a>
        </div>

        <div className="nav-actions">
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#8a8f98] hover:text-white transition-colors"
          >
            <span>Acme ERP (:8080)</span>
            <ExternalLink size={12} />
          </a>
          <a className="nav-demo-link" href="#demo">
            Interactive demo
          </a>
          <Link className="button button-small button-light" href="/dashboard">
            Launch Console <ArrowUpRight size={14} />
          </Link>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      <div className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <a href="#product" onClick={close}>
          Product <ArrowRight size={17} />
        </a>
        <a href="#how-it-works" onClick={close}>
          How it works <ArrowRight size={17} />
        </a>
        <a href="#security" onClick={close}>
          Reliability <ArrowRight size={17} />
        </a>
        <a href="#use-cases" onClick={close}>
          Use cases <ArrowRight size={17} />
        </a>
        <a
          href="http://localhost:8080"
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          Acme ERP Demo (:8080) <ExternalLink size={15} />
        </a>
        <Link className="button button-primary" href="/dashboard" onClick={close}>
          Launch Operations Console <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

function HeroProduct() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `rotateX(${12 - y * 2}deg) rotateY(${x * 1.8}deg) translateZ(0)`;
  };

  return (
    <div
      className="hero-product-stage reveal"
      onMouseMove={handleMove}
      onMouseLeave={() => cardRef.current && (cardRef.current.style.transform = '')}
    >
      <div className="hero-beam" />
      <div className="product-window hero-product axis-dashboard" ref={cardRef}>
        <div className="window-chrome">
          <div className="window-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="window-address">
            <BridgeMark size={12} /> legacybridge<span>/overview</span>
          </div>
          <div className="live-pill">
            <span /> LIVE
          </div>
        </div>
        <div className="axis-dash-layout">
          <aside className="axis-dash-sidebar">
            <div className="axis-dash-nav active">
              <Layers3 size={14} /> Overview
            </div>
            <Link href="/tasks" className="axis-dash-nav hover:text-white">
              <Play size={14} /> Tasks <span>12</span>
            </Link>
            <Link href="/runs" className="axis-dash-nav hover:text-white">
              <Radio size={14} /> Run history
            </Link>
            <Link href="/settings" className="axis-dash-nav hover:text-white">
              <Link2 size={14} /> Destinations
            </Link>
            <Link href="/settings" className="axis-dash-nav hover:text-white">
              <KeyRound size={14} /> Vault
            </Link>
            <div className="axis-dash-sidebar-label">WORKSPACE</div>
            <div className="axis-dash-task">
              <i className="green" /> Morning inventory
            </div>
            <div className="axis-dash-task">
              <i /> Vendor invoices
            </div>
            <div className="axis-dash-task">
              <i /> Plant 04 stock
            </div>
            <div className="axis-system-status">
              <span>
                <i /> All systems normal
              </span>
              <small>4 destinations connected</small>
            </div>
          </aside>
          <main className="axis-dash-main">
            <div className="axis-dash-grid-bg" />
            <div className="axis-metric-top">
              <span>RUN RELIABILITY</span>
              <div>
                <span className="active">Validated</span>
                <span>Completed</span>
              </div>
            </div>
            <div className="axis-metric-value">
              99.2<span>%</span>
              <em>+4.8%</em>
            </div>
            <div className="axis-chart-wrap">
              <svg viewBox="0 0 800 190" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="axisArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6874e8" stopOpacity=".24" />
                    <stop offset="100%" stopColor="#6874e8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="axisLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4c56b8" />
                    <stop offset="55%" stopColor="#8b95ff" />
                    <stop offset="100%" stopColor="#5E6AD2" />
                  </linearGradient>
                </defs>
                <g className="axis-chart-lines">
                  <path d="M0 30H800M0 80H800M0 130H800M0 180H800" />
                </g>
                <path
                  className="axis-chart-area"
                  d="M0 151 C70 145 105 118 155 126 S250 152 302 112 S390 50 445 71 S525 128 585 91 S678 61 726 68 S772 52 800 45 L800 190 L0 190 Z"
                />
                <path
                  className="axis-chart-path"
                  d="M0 151 C70 145 105 118 155 126 S250 152 302 112 S390 50 445 71 S525 128 585 91 S678 61 726 68 S772 52 800 45"
                />
                <circle cx="445" cy="71" r="4" className="axis-chart-point" />
              </svg>
              <div className="axis-chart-tooltip">99.2% valid</div>
            </div>
            <div className="axis-priority-head">
              <span>ACTIVE TASKS</span>
              <Link href="/dashboard" className="text-[10px] text-[#8b95ff] hover:underline">
                View all
              </Link>
            </div>
            <div className="axis-priority-list">
              <div className="axis-priority-row">
                <span className="axis-row-icon purple">
                  <Play size={11} />
                </span>
                <code>LB-2048</code>
                <strong>Morning inventory pull</strong>
                <span className="axis-row-tag">Daily 07:30</span>
                <span className="axis-row-avatar">OP</span>
              </div>
              <div className="axis-priority-row">
                <span className="axis-row-icon green">
                  <Check size={11} />
                </span>
                <code>LB-2044</code>
                <strong>Vendor invoice sync</strong>
                <span className="axis-row-tag">Validated</span>
                <span className="axis-row-avatar">FI</span>
              </div>
              <div className="axis-priority-row">
                <span className="axis-row-icon yellow">
                  <Clock3 size={11} />
                </span>
                <code>LB-2039</code>
                <strong>Plant 04 stock check</strong>
                <span className="axis-row-tag">Scheduled</span>
                <span className="axis-row-avatar">MFG</span>
              </div>
            </div>
          </main>
        </div>
        <div className="axis-command-palette">
          <div>
            <Sparkles size={14} />
            <span>Search tasks, runs, and destinations…</span>
            <kbd>⌘ K</kbd>
          </div>
          <p>
            <span>↵</span> Create a new LegacyBridge task
          </p>
        </div>
        <div className="axis-agent-insight">
          <span>
            <Sparkles size={12} /> AGENT INSIGHT
          </span>
          <p>Table structure detected. Three fields mapped to your output schema.</p>
          <div>
            <strong>Suggested action</strong>
            <em>
              Validate output <ArrowRight size={10} />
            </em>
          </div>
        </div>
        <div className="axis-delivery-float">
          <span>
            <CheckCircle2 size={13} /> Delivered
          </span>
          <strong>#ops-reports</strong>
          <div>
            <i style={{ width: '100%' }} />
          </div>
          <small>Slack · just now</small>
        </div>
        <div className="axis-cursor">
          <MousePointer2 size={17} fill="currentColor" />
          <span>LegacyBridge</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grid" />
      <div className="hero-aurora" />
      <div className="axis-particles" aria-hidden="true">
        {Array.from({ length: 38 }, (_, index) => (
          <i
            key={index}
            style={
              {
                '--x': `${(index * 37) % 100}%`,
                '--delay': `${-(index % 13) * 0.41}s`,
                '--duration': `${3.2 + (index % 6) * 0.55}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="container hero-content">
        <h1 className="reveal">
          The new standard for
          <br />
          <span>legacy integration</span>
        </h1>
        <p className="hero-subtitle reveal reveal-delay-1">
          Describe the task in plain English. Turn any legacy portal into a validated, scheduled data
          feed — no API required.
        </p>
        <div className="hero-actions reveal reveal-delay-2">
          <a className="button button-primary button-large" href="#demo">
            Start bridging <ArrowRight size={16} />
          </a>
          <Link className="axis-hero-secondary" href="/dashboard">
            Launch Operations Console <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <div className="container hero-visual">
        <HeroProduct />
      </div>
    </section>
  );
}

function IntegrationStrip() {
  const top = [
    { name: 'Slack', icon: Hash },
    { name: 'Google Sheets', icon: Table2 },
    { name: 'PostgreSQL', icon: Database },
    { name: 'Webhooks', icon: Webhook },
    { name: 'TinyFish', icon: Fish },
    { name: 'JSON', icon: Braces },
  ];
  const bottom = [
    { name: 'Legacy ERP', icon: Building2 },
    { name: 'Cloud Browser', icon: Cloud },
    { name: 'FastAPI', icon: Code2 },
    { name: 'SQL', icon: Database },
    { name: 'Vault', icon: KeyRound },
    { name: 'Web Agent', icon: Globe2 },
  ];

  const LogoRow = ({
    items,
    reverse = false,
  }: {
    items: Array<{ name: string; icon: typeof Hash }>;
    reverse?: boolean;
  }) => (
    <div className="axis-logo-viewport">
      <div className={`axis-logo-track ${reverse ? 'reverse' : ''}`}>
        {[...items, ...items, ...items].map(({ name, icon: Icon }, index) => (
          <div className="axis-client-logo" key={`${name}-${index}`}>
            <Icon size={19} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="axis-clients" aria-label="Destinations and technology">
      <div className="axis-clients-header reveal">
        <h2>One bridge between old portals and modern tools.</h2>
        <p>From the systems you have to the destinations your team already uses.</p>
      </div>
      <LogoRow items={top} />
      <LogoRow items={bottom} reverse />
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="axis-features" id="product">
      <div className="axis-feature-header reveal">
        <h2>
          Made for the systems
          <br />
          you can’t replace
        </h2>
        <div>
          <p>
            LegacyBridge is shaped by a simple idea: automation should adapt to your business — not
            force your business to rebuild around it.
          </p>
          <a href="#how-it-works">
            Explore the method <ArrowRight size={14} />
          </a>
        </div>
      </div>
      <div className="axis-feature-grid">
        <article className="axis-feature-card reveal">
          <div className="axis-feature-visual axis-layers-visual">
            <div className="axis-layer axis-layer-back">
              <span>legacy_portal.exe</span>
            </div>
            <div className="axis-layer axis-layer-mid">
              <span>agent_goal.json</span>
              <i />
              <i />
              <i />
            </div>
            <div className="axis-layer axis-layer-top">
              <code>
                {'{'}
                <br />
                &nbsp;&nbsp;&quot;goal&quot;: &quot;extract&quot;,
                <br />
                &nbsp;&nbsp;&quot;format&quot;: &quot;json&quot;
                <br />
                {'}'}
              </code>
            </div>
            <span className="axis-floating-label label-one">Describe</span>
            <span className="axis-floating-label label-two">Extract</span>
            <span className="axis-floating-label label-three">Deliver</span>
          </div>
          <div className="axis-card-footer">
            <h3>Purpose-built for legacy portals</h3>
            <span className="axis-plus">+</span>
          </div>
        </article>
        <article className="axis-feature-card reveal reveal-delay-1">
          <div className="axis-feature-visual axis-speed-visual">
            <div className="axis-speed-grid" />
            <div className="axis-speed-lines">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="axis-speed-value">
              <span>
                19<span>s</span>
              </span>
              <small>SIMULATED RUN</small>
            </div>
            <div className="axis-speed-caption">
              <Zap size={13} /> Prompt to validated data
            </div>
          </div>
          <div className="axis-card-footer">
            <h3>Designed to move fast</h3>
            <span className="axis-plus">+</span>
          </div>
        </article>
        <article className="axis-feature-card reveal reveal-delay-2">
          <div className="axis-feature-visual axis-craft-visual">
            <div className="axis-craft-grid" />
            <div className="axis-craft-shadow" />
            <div className="axis-approve-3d">
              <ShieldCheck size={18} />
              <span>Approve</span>
            </div>
            <div className="axis-craft-cursor">
              <MousePointer2 size={22} fill="currentColor" />
              <span>You</span>
            </div>
            <span className="axis-guide guide-x" />
            <span className="axis-guide guide-y" />
          </div>
          <div className="axis-card-footer">
            <h3>Crafted for human control</h3>
            <span className="axis-plus">+</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <>
      <section className="axis-dual-section" id="how-it-works">
        <article className="axis-dual-panel reveal">
          <div className="axis-dual-copy">
            <h2>LegacyBridge Agent</h2>
            <p>
              Give a cloud browser a plain-English goal. It signs in securely, understands the live
              page, and extracts what you asked for.
            </p>
          </div>
          <div className="axis-triage-visual">
            <div className="axis-triage-window">
              <div className="axis-triage-head">
                <span>
                  <Sparkles size={13} /> Agent plan
                </span>
                <span className="axis-live-tag">
                  <i /> RUNNING
                </span>
              </div>
              <div className="axis-triage-row muted">
                <Check size={12} />
                <span>Authenticate with Vault</span>
                <small>0:03</small>
              </div>
              <div className="axis-triage-row muted">
                <Check size={12} />
                <span>Open Reports → Q3 Sales</span>
                <small>0:09</small>
              </div>
              <div className="axis-triage-row active">
                <MousePointer2 size={12} />
                <span>Extract the inventory table</span>
                <small>NOW</small>
              </div>
              <div className="axis-triage-row muted">
                <ShieldCheck size={12} />
                <span>Validate output schema</span>
                <small>Next</small>
              </div>
              <div className="axis-reasoning-card">
                <span>WHY THIS PATH?</span>
                <p>
                  The agent found the same table structure described in your goal — no selector or
                  XPath required.
                </p>
                <div>
                  <span>ALTERNATIVES</span>
                  <strong>
                    Continue run <ArrowRight size={11} />
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </article>
        <article className="axis-dual-panel reveal reveal-delay-1">
          <div className="axis-dual-copy">
            <h2>Schema-validated delivery</h2>
            <p>
              Every result is checked against a clear contract before it reaches Slack, Sheets, a
              webhook, or your SQL database.
            </p>
          </div>
          <div className="axis-mcp-visual">
            <pre className="axis-code-background">{`{
  "region": "North",
  "units": 1240,
  "quarter": "Q3",
  "validated": true,
  "destination": "#ops-reports"
}`}</pre>
            <div className="axis-validation-chat">
              <div className="axis-chat-title">
                <FileCheck2 size={14} />
                <span>Output contract</span>
                <span>STRICT</span>
              </div>
              <p>
                <Check size={11} /> region <em>string · passed</em>
              </p>
              <p>
                <Check size={11} /> units <em>integer · passed</em>
              </p>
              <p>
                <Check size={11} /> quarter <em>enum · passed</em>
              </p>
              <div className="axis-chat-input">
                <span>Ready to deliver</span>
                <ArrowUpRight size={13} />
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="axis-roadmap-section">
        <div className="axis-roadmap-copy reveal">
          <span className="axis-roadmap-tag">
            <i /> SCHEDULED, REPEATABLE RUNS
          </span>
          <h2>
            Set every portal
            <br />
            on autopilot
          </h2>
          <p>
            Turn one-off extraction into a dependable schedule. LegacyBridge runs in the background and
            keeps a complete trail of every result.
          </p>
        </div>
        <div className="axis-roadmap-scene" aria-hidden="true">
          <div className="axis-roadmap-plane">
            <div className="axis-roadmap-grid" />
            <span className="axis-date date-one">06:00</span>
            <span className="axis-date date-two">07:00</span>
            <span className="axis-date date-three">08:00</span>
            <span className="axis-date date-four">09:00</span>
            <div className="axis-schedule-task task-a">
              <span className="task-diamond">
                <Play size={12} />
              </span>
              <div>
                <strong>Morning inventory pull</strong>
                <small>SLACK · DAILY</small>
              </div>
            </div>
            <div className="axis-schedule-task task-b">
              <span className="task-diamond">
                <Table2 size={12} />
              </span>
              <div>
                <strong>Vendor invoice sync</strong>
                <small>SHEETS · MONDAY</small>
              </div>
            </div>
            <div className="axis-schedule-task task-c">
              <span className="task-diamond">
                <Database size={12} />
              </span>
              <div>
                <strong>Plant 04 stock check</strong>
                <small>POSTGRES · HOURLY</small>
              </div>
            </div>
            <div className="axis-now-laser">
              <span>NOW · 07:30</span>
            </div>
            <div className="axis-velocity-widget">
              <span>
                RUN HEALTH <em>▲ 4.8%</em>
              </span>
              <strong>99.2%</strong>
              <div>
                {[35, 48, 42, 66, 58, 76, 68, 88, 82, 94].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ResultTable({ preset }: { preset: PresetData }) {
  return (
    <div className="result-table-wrap">
      <table className="result-table">
        <thead>
          <tr>
            {preset.columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preset.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {preset.columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-summary">
        <span>{preset.rows.length} rows</span>
        <span>{preset.columns.length} columns</span>
        <span>0 validation errors</span>
      </div>
    </div>
  );
}

function DemoConsole({
  preset,
  notify,
}: {
  preset: PresetData;
  notify: (msg: string) => void;
}) {
  const [prompt, setPrompt] = useState(preset.prompt);
  const [destination, setDestination] = useState(preset.destination);
  const [schedule, setSchedule] = useState(preset.schedule);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('success');
  const [currentStep, setCurrentStep] = useState(4);
  const [activeTab, setActiveTab] = useState<'table' | 'json' | 'log'>('table');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPrompt(preset.prompt);
    setDestination(preset.destination);
    setSchedule(preset.schedule);
    setActiveTab('table');
    if (preset.nonce) {
      setStatus('idle');
      setCurrentStep(-1);
    } else {
      setStatus('success');
      setCurrentStep(4);
    }
  }, [preset]);

  const target = destinationTargets[preset.id]?.[destination] || 'Connected destination';
  const runSteps = [
    { title: 'Secure session started', detail: 'Vault login · credentials hidden' },
    { title: 'Portal navigation complete', detail: 'Found the requested live view' },
    { title: 'Data extracted', detail: `${preset.rows.length} rows · ${preset.columns.length} fields captured` },
    { title: 'Schema validation passed', detail: 'Required fields present · 0 errors' },
    { title: `Delivered to ${destination}`, detail: target },
  ];

  useEffect(() => {
    if (status !== 'running') return undefined;
    const delay = currentStep === 1 ? 1050 : 780;
    const timer = window.setTimeout(() => {
      if (currentStep < runSteps.length - 1) {
        setCurrentStep((step) => step + 1);
      } else {
        setStatus('success');
        setActiveTab('table');
        notify(`Run complete — data delivered to ${destination}.`);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [status, currentStep, destination, runSteps.length, notify]);

  const startRun = () => {
    if (!prompt.trim()) {
      setStatus('error');
      notify('Describe the task before starting a run.');
      return;
    }
    setStatus('running');
    setCurrentStep(0);
    setCopied(false);
  };

  const jsonOutput = JSON.stringify(
    {
      task: preset.taskName,
      source: 'legacy-portal',
      data: preset.rows,
      validation: { status: 'passed', errors: 0 },
      destination: { type: destination, target },
    },
    null,
    2
  );

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      notify('Validated JSON copied to clipboard.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify('Clipboard access is unavailable in this browser.');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${preset.id}-legacybridge-output.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('JSON output downloaded.');
  };

  const statusLabel =
    status === 'running'
      ? 'Agent running'
      : status === 'success'
      ? 'Run completed'
      : status === 'error'
      ? 'Task required'
      : 'Ready to run';

  return (
    <div className={`demo-console ${status === 'running' ? 'is-running' : ''}`}>
      <div className="window-chrome demo-chrome">
        <div className="window-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="demo-console-title">
          <BridgeMark size={17} />
          <span>LegacyBridge</span>
          <i />
          Task Builder
        </div>
        <div className={`demo-status ${status}`}>
          <span />
          {statusLabel}
        </div>
      </div>
      <div className="demo-body">
        <div className="task-builder">
          <div className="demo-panel-heading">
            <div>
              <span className="mini-breadcrumb">NEW TASK</span>
              <h3>{preset.taskName}</h3>
            </div>
            <span className="demo-step-tag">01 / DEFINE</span>
          </div>
          <label className="field-label" htmlFor="task-prompt">
            What should the agent do?
          </label>
          <div className="prompt-textarea-wrap">
            <Sparkles size={15} />
            <textarea
              id="task-prompt"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (status === 'error') setStatus('idle');
              }}
              disabled={status === 'running'}
              rows={5}
            />
          </div>
          <label className="field-label">Where should the data go?</label>
          <div className="destination-picker">
            {Object.entries(destinationMeta).map(([name, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={name}
                  className={`destination-option ${destination === name ? 'selected' : ''}`}
                  onClick={() => setDestination(name)}
                  disabled={status === 'running'}
                  aria-pressed={destination === name}
                  type="button"
                >
                  <Icon size={15} />
                  <span>{name}</span>
                  {destination === name && <Check size={12} />}
                </button>
              );
            })}
          </div>
          <label className="field-label" htmlFor="task-schedule">
            When should it run?
          </label>
          <div className="select-wrap">
            <CalendarClock size={15} />
            <select
              id="task-schedule"
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              disabled={status === 'running'}
            >
              <option>Run once</option>
              <option>Daily at 07:30</option>
              <option>Every Monday at 09:00</option>
              <option>Every 6 hours</option>
              <option>Daily at 06:45</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <button
            className="button button-primary run-button"
            onClick={startRun}
            disabled={status === 'running'}
            type="button"
          >
            {status === 'running' ? (
              <>
                <Loader2 size={16} className="spin" /> Agent is working…
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" /> {status === 'idle' ? 'Run this task' : 'Replay the run'}
                <ArrowRight size={15} />
              </>
            )}
          </button>
          <div className="task-builder-foot">
            <LockKeyhole size={12} />
            <span>Read-only by default. Credentials stay in Vault.</span>
          </div>
        </div>

        <div className="run-monitor">
          <div className="demo-panel-heading run-monitor-heading">
            <div>
              <span className="mini-breadcrumb">RUN MONITOR</span>
              <h3>
                {preset.runId} <span>· Live trace</span>
              </h3>
            </div>
            <span className="demo-step-tag">02 / OBSERVE</span>
          </div>
          <div className="demo-run-steps">
            {runSteps.map((step, index) => {
              const complete =
                status === 'success' || (status !== 'idle' && status !== 'error' && index < currentStep);
              const active = status === 'running' && index === currentStep;
              return (
                <div
                  className={`demo-run-step ${complete ? 'complete' : ''} ${active ? 'active' : ''}`}
                  key={step.title}
                >
                  <span className="demo-run-step-icon">
                    {complete ? (
                      <Check size={11} />
                    ) : active ? (
                      <Loader2 size={12} className="spin" />
                    ) : (
                      <span />
                    )}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                  </div>
                  {complete && (
                    <time>
                      {index === 0
                        ? '0:03'
                        : index === 1
                        ? '0:09'
                        : index === 2
                        ? '0:16'
                        : index === 3
                        ? '0:18'
                        : '0:19'}
                    </time>
                  )}
                </div>
              );
            })}
          </div>
          <div className={`output-panel ${status === 'running' ? 'is-updating' : ''}`}>
            <div className="output-tabs-row">
              <div className="output-tabs" role="tablist" aria-label="Run output">
                <button
                  role="tab"
                  aria-selected={activeTab === 'table'}
                  className={activeTab === 'table' ? 'active' : ''}
                  onClick={() => setActiveTab('table')}
                  type="button"
                >
                  <Table2 size={13} /> Table
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'json'}
                  className={activeTab === 'json' ? 'active' : ''}
                  onClick={() => setActiveTab('json')}
                  type="button"
                >
                  <Braces size={13} /> JSON
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'log'}
                  className={activeTab === 'log' ? 'active' : ''}
                  onClick={() => setActiveTab('log')}
                  type="button"
                >
                  <ScrollText size={13} /> Run log
                </button>
              </div>
              <div className="output-actions">
                <button
                  onClick={copyJson}
                  aria-label="Copy JSON"
                  title="Copy JSON"
                  type="button"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={downloadJson}
                  aria-label="Download JSON"
                  title="Download JSON"
                  type="button"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
            <div className="output-content" role="tabpanel">
              <div className="output-result-title">
                <div>
                  <span className="mini-breadcrumb">EXTRACTED RESULT</span>
                  <h4>{preset.resultTitle}</h4>
                </div>
                <span className="schema-valid">
                  <ShieldCheck size={12} /> Schema valid
                </span>
              </div>
              {activeTab === 'table' && <ResultTable preset={preset} />}
              {activeTab === 'json' && <pre className="json-output">{jsonOutput}</pre>}
              {activeTab === 'log' && (
                <div className="run-log">
                  {status === 'idle' || status === 'error' ? (
                    <div className="empty-log">
                      <ScrollText size={23} />
                      <p>Run this task to generate a fresh audit trace.</p>
                    </div>
                  ) : (
                    runSteps
                      .slice(0, status === 'success' ? 5 : currentStep + 1)
                      .map((step, index) => (
                        <div key={step.title}>
                          <time>07:30:{String(3 + index * 4).padStart(2, '0')}</time>
                          <span className="log-level">INFO</span>
                          <p>
                            {step.title} — {step.detail}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
            <div className="delivery-bar">
              <div className="delivery-bar-icon">
                {(() => {
                  const Icon = destinationMeta[destination]?.icon || Database;
                  return <Icon size={15} />;
                })()}
              </div>
              <div>
                <span>DELIVERY DESTINATION</span>
                <strong>
                  {destination} <i>→</i> {target}
                </strong>
              </div>
              <span className={`delivery-check ${status === 'success' ? 'visible' : ''}`}>
                <CheckCircle2 size={15} /> Delivered
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="demo-disclaimer">
        <CircleDot size={11} /> Interactive product preview · All portal activity and data are simulated
      </div>
    </div>
  );
}

function DemoSection({ preset }: { preset: PresetData }) {
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <section className="section demo-section" id="demo">
      <div className="demo-grid-bg" />
      <div className="container">
        <div className="section-heading demo-heading reveal">
          <div>
            <span className="section-kicker">THE PRODUCT, IN MOTION</span>
            <h2>
              Don’t take our word for it.
              <br />
              <span className="text-gradient">Run the workflow.</span>
            </h2>
          </div>
          <p>
            Edit the task, pick a destination and watch LegacyBridge move from intent to validated
            output.
          </p>
        </div>
        <div className="reveal">
          <DemoConsole preset={preset} notify={notify} />
        </div>
      </div>
      <div className={`toast ${toast ? 'show' : ''}`} role="status">
        <CheckCircle2 size={16} />
        {toast}
      </div>
    </section>
  );
}

function ReliabilitySection() {
  const [approved, setApproved] = useState(false);
  const [inspected, setInspected] = useState(false);

  return (
    <section className="axis-reliability" id="security">
      <div className="axis-issue-grid">
        <article className="axis-issue-panel reveal">
          <div className="axis-issue-copy">
            <span>VALIDATION AND RUN HEALTH</span>
            <h3>Build confidence with every run</h3>
            <p>
              A finished browser session is not enough. LegacyBridge proves the shape and completeness
              of every result before delivery.
            </p>
          </div>
          <div className="axis-cycles-visual">
            <div className="axis-cycles-head">
              <span>
                <i /> Validation rate
              </span>
              <strong>Last 14 runs</strong>
            </div>
            <div className="axis-cycles-chart">
              <div className="axis-chart-grid-lines" />
              <svg viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="reliabilityArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5E6AD2" stopOpacity=".3" />
                    <stop offset="100%" stopColor="#5E6AD2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="area"
                  d="M0 128 C55 126 78 105 118 110 S190 122 230 84 S300 69 335 57 S420 38 500 22 L500 160 L0 160Z"
                />
                <path
                  className="line"
                  d="M0 128 C55 126 78 105 118 110 S190 122 230 84 S300 69 335 57 S420 38 500 22"
                />
              </svg>
              <span className="axis-chart-now">
                <strong>99.2%</strong>
                <small>SCHEMA VALID</small>
              </span>
            </div>
            <div className="axis-validation-list">
              <span>
                <Check size={11} /> Required fields <strong>3 / 3</strong>
              </span>
              <span>
                <Check size={11} /> Type checks <strong>PASSED</strong>
              </span>
              <span>
                <Check size={11} /> Delivery contract <strong>VALID</strong>
              </span>
            </div>
          </div>
        </article>

        <article className="axis-issue-panel reveal reveal-delay-1">
          <div className="axis-issue-copy">
            <span>HUMAN-IN-THE-LOOP CONTROL</span>
            <h3>Manage sensitive actions with intent</h3>
            <p>
              Extraction is read-only by default. When a task needs to write back, a person stays in
              control of the final action.
            </p>
          </div>
          <div className="axis-approval-window">
            <div className="axis-approval-head">
              <span>Approval queue</span>
              <span>1 PENDING</span>
            </div>
            <div className="axis-approval-item muted">
              <LockKeyhole size={12} />
              <div>
                <strong>Read inventory table</strong>
                <small>Read-only · no approval needed</small>
              </div>
              <Check size={12} />
            </div>
            <div className="axis-approval-item active">
              <LockKeyhole size={12} />
              <div>
                <strong>Update inventory record</strong>
                <small>Write action · approval required</small>
              </div>
              <span>WAITING</span>
            </div>
            <div className="axis-approval-menu">
              <span>REVIEW WRITE ACTION</span>
              <p>
                Update 3 stock values in the legacy ERP. The proposed changes are available in the
                run snapshot.
              </p>
              {inspected && (
                <div className="axis-change-diff">
                  <span>
                    AL-204 <del>180 kg</del> <ins>240 kg</ins>
                  </span>
                  <span>
                    BR-118 <del>42 units</del> <ins>60 units</ins>
                  </span>
                  <span>
                    PK-032 <del>95 kg</del> <ins>120 kg</ins>
                  </span>
                </div>
              )}
              <div>
                <button
                  type="button"
                  aria-expanded={inspected}
                  onClick={() => setInspected((value) => !value)}
                >
                  {inspected ? 'Hide changes' : 'Inspect changes'}
                </button>
                <button
                  type="button"
                  className={approved ? 'approved' : ''}
                  aria-pressed={approved}
                  onClick={() => setApproved((value) => !value)}
                >
                  {approved ? (
                    <>
                      <Check size={11} /> Approved
                    </>
                  ) : (
                    'Approve write'
                  )}
                </button>
              </div>
            </div>
            <div className="axis-approval-item muted">
              <ScrollText size={12} />
              <div>
                <strong>Store audit receipt</strong>
                <small>Runs after the decision</small>
              </div>
              <span>QUEUED</span>
            </div>
          </div>
        </article>
      </div>

      <div className="axis-feature-footer reveal">
        <div>
          <Braces size={17} />
          <h4>Goal in, JSON out</h4>
          <p>Structured data without a custom API.</p>
        </div>
        <div>
          <MousePointer2 size={17} />
          <h4>No selectors to maintain</h4>
          <p>The agent reads the live interface.</p>
        </div>
        <div>
          <KeyRound size={17} />
          <h4>Credentials stay protected</h4>
          <p>Vault logins never enter your prompt.</p>
        </div>
        <div>
          <Fingerprint size={17} />
          <h4>Every result is traceable</h4>
          <p>Replay, output and delivery in one trail.</p>
        </div>
      </div>
    </section>
  );
}

function UseCases({ onLoadPreset }: { onLoadPreset: (preset: PresetData) => void }) {
  const [active, setActive] = useState<PresetKey>('operations');
  const item = useCases.find((useCase) => useCase.id === active) || useCases[0];
  const preset: PresetData = { ...presets[active], nonce: Date.now() };

  return (
    <section className="section use-cases-section" id="use-cases">
      <div className="container">
        <div className="section-heading split-heading reveal">
          <div>
            <span className="section-kicker">BUILT FOR PORTAL-BOUND TEAMS</span>
            <h2>
              One bridge.
              <br />A hundred busywork tasks.
            </h2>
          </div>
          <p>
            If your team can explain the task, LegacyBridge can turn it into a repeatable data flow.
            Start with the work that happens every single day.
          </p>
        </div>
        <div className="use-case-tabs reveal" role="tablist" aria-label="Use cases">
          {useCases.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              className={active === id ? 'active' : ''}
              onClick={() => setActive(id)}
              type="button"
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <div className="use-case-panel reveal" key={item.id}>
          <div className="use-case-copy">
            <span className="use-case-eyebrow">{item.eyebrow}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="before-after">
              <div>
                <span className="before-icon">
                  <X size={12} />
                </span>
                <div>
                  <strong>Without LegacyBridge</strong>
                  <p>{item.before}</p>
                </div>
              </div>
              <div>
                <span className="after-icon">
                  <Check size={12} />
                </span>
                <div>
                  <strong>With LegacyBridge</strong>
                  <p>{item.after}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="use-case-example">
            <div className="example-window-head">
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>
              <span>TASK RECIPE</span>
              <Sparkles size={13} />
            </div>
            <div className="example-task">
              <span className="mini-breadcrumb">PLAIN-ENGLISH GOAL</span>
              <p>“{presets[active].prompt}”</p>
            </div>
            <div className="example-meta">
              <div>
                <span>DESTINATION</span>
                <strong>{presets[active].destination}</strong>
              </div>
              <div>
                <span>SCHEDULE</span>
                <strong>{presets[active].schedule}</strong>
              </div>
            </div>
            <div className="example-result">
              <div>
                <CheckCircle2 size={14} />
                <span>{presets[active].resultTitle}</span>
              </div>
              <span>{presets[active].rows.length} rows · Validated</span>
            </div>
            <button
              className="button button-light example-button"
              onClick={() => onLoadPreset(preset)}
              type="button"
            >
              Load this task in the demo <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="impact-banner reveal">
          <div className="impact-icon">
            <Clock3 size={23} />
          </div>
          <div>
            <span>ILLUSTRATIVE MORNING WORKFLOW</span>
            <h3>Two hours of portal work. One scheduled run.</h3>
          </div>
          <p>
            The concept’s manufacturer scenario targets <strong>under one minute</strong> for a report
            that previously took about two hours to compile. Target, not benchmark.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-grid" />
      <div className="final-cta-glow" />
      <div className="container final-cta reveal">
        <div className="final-mark">
          <BridgeMark size={37} />
        </div>
        <span className="section-kicker">YOUR NEXT INTEGRATION CAN START WITH A SENTENCE</span>
        <h2>
          Describe the task.
          <br />
          <span>Keep the old system.</span>
        </h2>
        <p>The new standard for turning legacy portals into reliable, validated data feeds.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a className="button button-primary button-large" href="#demo">
            Build your first bridge <ArrowRight size={17} />
          </a>
          <Link className="button button-ghost button-large" href="/dashboard">
            <LayoutDashboard size={16} /> Open Operations Console
          </Link>
        </div>
        <span className="final-note">No API required · Interactive concept demo</span>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <BridgeMark />
            </span>
            <span>LegacyBridge</span>
          </a>
          <p>
            Structured data out of systems
            <br />
            that never had an API.
          </p>
          <span className="footer-status">
            <i /> Concept prototype · HackIIITD 2026
          </span>
        </div>
        <div className="footer-links">
          <div>
            <strong>PRODUCT</strong>
            <a href="#how-it-works">How it works</a>
            <a href="#demo">Interactive demo</a>
            <a href="#security">Reliability</a>
          </div>
          <div>
            <strong>EXPLORE</strong>
            <a href="#use-cases">Use cases</a>
            <a href="#product">Why LegacyBridge</a>
            <a href="/legacybridge-brief.pdf" target="_blank" rel="noreferrer">
              Original idea brief <ArrowUpRight size={11} />
            </a>
          </div>
          <div>
            <strong>TEAM</strong>
            <span>Team Aspirations</span>
            <span>Tushar Bisht · Team lead</span>
            <span>Sourav · Team member</span>
          </div>
        </div>
      </div>
      <div className="axis-footer-word" aria-hidden="true">
        LEGACYBRIDGE
      </div>
      <div className="container footer-bottom">
        <span>© 2026 LegacyBridge. Concept experience.</span>
        <span>Demo data is simulated. Performance targets are illustrative.</span>
        <a href="#top">
          Back to top <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}

export default function AxisLandingPage() {
  const [demoPreset, setDemoPreset] = useState<PresetData>({ ...presets.operations, nonce: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px' }
    );
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const loadPreset = (preset: PresetData) => {
    setDemoPreset(preset);
    window.setTimeout(
      () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <IntegrationStrip />
        <ProblemSection />
        <HowItWorks />
        <DemoSection preset={demoPreset} />
        <ReliabilitySection />
        <UseCases onLoadPreset={loadPreset} />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
