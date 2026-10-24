'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Copy,
  Database,
  FileCode2,
  FileSearch,
  FileText,
  GitBranch,
  Globe2,
  Layers3,
  Loader2,
  LockKeyhole,
  Menu,
  MessageSquare,
  Network,
  Play,
  Plus,
  Route,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TestTube2,
  X,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const navItems = [
  ['Product', '#product'],
  ['Method', '#method'],
  ['Security', '#security'],
  ['Research', '#research'],
  ['Roadmap', '#roadmap'],
];

function BridgeMark({ size = 22 }: { size?: number }) {
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

function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link className={`ax-logo ${footer ? 'ax-logo-footer' : ''}`} href="/" aria-label="LegacyBridge home">
      <span>
        <BridgeMark size={footer ? 25 : 22} />
      </span>
      <strong>LegacyBridge</strong>
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isClerkEnabled = typeof window !== 'undefined'
    ? !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder')
    : !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
    <header className={`ax-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <Logo />
      <nav className="ax-nav-pill" aria-label="Main navigation">
        {navItems.map(([label, href]) => (
          <a key={label} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="ax-nav-auth">
        {isClerkEnabled ? (
          <>
            <SignedIn>
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="text-xs text-[#8b8d92] hover:text-white transition">
                  Console
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs text-[#8b8d92] hover:text-white transition cursor-pointer">Log in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="ax-signup cursor-pointer">Sign up</button>
              </SignUpButton>
            </SignedOut>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="text-xs text-[#8b8d92] hover:text-white transition">
              Log in
            </Link>
            <Link className="ax-signup" href="/dashboard">
              Console
            </Link>
          </>
        )}
      </div>
      <button
        className="ax-menu-button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={`ax-mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        {navItems.map(([label, href]) => (
          <a key={label} href={href} onClick={close}>
            {label}
            <ArrowRight size={15} />
          </a>
        ))}
        <Link href="/dashboard" onClick={close}>
          Launch Console
          <ArrowRight size={15} />
        </Link>
        <Link className="ax-mobile-signup" href="/drift" onClick={close}>
          Drift Detector
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}

function ProductMockup() {
  const card = useRef<HTMLDivElement>(null);

  const move = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!card.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    card.current.style.setProperty('--ax-ry', `${x * 1.4}deg`);
  };

  const leave = () => card.current?.style.setProperty('--ax-ry', '0deg');

  return (
    <div className="ax-product-stage" onMouseMove={move} onMouseLeave={leave}>
      <div className="ax-product-window" ref={card}>
        <div className="ax-window-top">
          <span className="ax-window-dots">
            <i />
            <i />
            <i />
          </span>
          <div className="ax-window-address">
            <LockKeyhole size={9} /> legacybridge <em>/</em> overview
          </div>
          <span className="ax-sample-pill">
            <i /> SAMPLE ERP
          </span>
        </div>
        <div className="ax-window-body">
          <aside className="ax-mock-sidebar">
            <Link href="/dashboard" className="active flex items-center gap-1.5 hover:text-white transition">
              <Layers3 size={12} /> Overview
            </Link>
            <Link href="/analysis" className="flex items-center gap-1.5 hover:text-white transition">
              <FileSearch size={12} /> Discovery
            </Link>
            <Link href="/business-logic" className="flex items-center gap-1.5 hover:text-white transition">
              <Braces size={12} /> Business rules <span>24</span>
            </Link>
            <Link href="/migration" className="flex items-center gap-1.5 hover:text-white transition">
              <Route size={12} /> Migration
            </Link>
            <Link href="/drift" className="flex items-center gap-1.5 hover:text-white transition">
              <ShieldCheck size={12} /> Validation <span>3</span>
            </Link>
            <small>WORKSPACE</small>
            <p>
              <i /> Order management
            </p>
            <div className="ax-mock-system">
              <span>
                <i /> Active Modernization
              </span>
              <small>Acme Monolith ERP</small>
            </div>
          </aside>
          <main className="ax-mock-main">
            <div className="ax-mock-heading">
              <div>
                <span>DEPENDENCY INTELLIGENCE</span>
                <strong>
                  38 <em>relationships</em>
                </strong>
              </div>
              <div className="ax-mock-tabs">
                <span className="active">Source map</span>
                <span>Rules</span>
              </div>
            </div>
            <div className="ax-mock-chart">
              <svg viewBox="0 0 760 200" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="axArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7379ec" stopOpacity=".22" />
                    <stop offset="1" stopColor="#7379ec" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="axLine" x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="#434a98" />
                    <stop offset=".55" stopColor="#9299ff" />
                    <stop offset="1" stopColor="#656ee0" />
                  </linearGradient>
                </defs>
                <g className="ax-chart-grid">
                  <path d="M0 35H760M0 90H760M0 145H760M0 195H760" />
                </g>
                <path
                  className="ax-chart-area"
                  d="M0 165 C80 155 115 128 170 139 S270 160 330 117 S430 51 490 78 S585 127 645 93 S720 61 760 69 L760 200 L0 200Z"
                />
                <path
                  className="ax-chart-line"
                  d="M0 165 C80 155 115 128 170 139 S270 160 330 117 S430 51 490 78 S585 127 645 93 S720 61 760 69"
                />
                <circle cx="490" cy="78" r="4" className="ax-chart-point" />
              </svg>
              <div className="ax-chart-tooltip">COUPLING: 0.88 (HOTSPOT)</div>
            </div>
            <div className="ax-mock-priority">
              <span>BUSINESS RULE REVIEW</span>
              <Link href="/business-logic" className="hover:text-white transition">
                View all →
              </Link>
            </div>
            <div className="ax-mock-rows">
              <Link href="/drift" className="hover:bg-white/[0.03] transition block">
                <span className="ax-row-icon red">
                  <AlertTriangle size={10} />
                </span>
                <code>BR-001</code>
                <strong>Insufficient inventory guard</strong>
                <span className="ax-row-tag red">Drift risk</span>
                <span className="ax-row-avatar">OR</span>
              </Link>
              <Link href="/business-logic" className="hover:bg-white/[0.03] transition block">
                <span className="ax-row-icon violet">
                  <Sparkles size={10} />
                </span>
                <code>BR-002</code>
                <strong>High-value order approval</strong>
                <span className="ax-row-tag">Review</span>
                <span className="ax-row-avatar">AI</span>
              </Link>
              <Link href="/business-logic" className="hover:bg-white/[0.03] transition block">
                <span className="ax-row-icon green">
                  <Check size={10} />
                </span>
                <code>BR-003</code>
                <strong>Stock reservation window</strong>
                <span className="ax-row-tag green">Source-linked</span>
                <span className="ax-row-avatar">IN</span>
              </Link>
            </div>
          </main>
        </div>
        <div className="ax-mock-search">
          <Search size={12} />
          <span>Search rules, services, and evidence…</span>
          <kbd>⌘ K</kbd>
          <Link href="/migration" className="ml-auto text-[#8b95ff] hover:underline flex items-center gap-1">
            <span>↵</span> Create migration review
          </Link>
        </div>
        <div className="ax-mock-insight">
          <span>
            <Sparkles size={10} /> RESEARCH INSIGHT
          </span>
          <p>Official documentation linked for the selected framework version.</p>
          <div>
            <strong>TinyFish Verified Citation</strong>
            <Link href="/research" className="flex items-center gap-1 hover:text-[#8b95ff] transition">
              Review source <ArrowRight size={9} />
            </Link>
          </div>
        </div>
        <div className="ax-mock-deploy">
          <span>
            <CheckCircle2 size={11} /> Human review
          </span>
          <strong>Migration plan</strong>
          <div>
            <i />
          </div>
          <small>Awaiting approval · Gate Active</small>
        </div>
        <div className="ax-mock-cursor">
          <span>LegacyBridge</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="ax-hero" id="top">
      <div className="ax-hero-grid" />
      <div className="ax-hero-beam" />
      <div className="ax-hero-particles" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i
            key={index}
            style={
              {
                '--x': `${44 + ((index * 17) % 15)}%`,
                '--y': `${8 + ((index * 29) % 64)}%`,
                '--d': `${-(index % 9) * 0.47}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="ax-hero-copy">
        <h1>
          The new standard for
          <br />
          <span>legacy modernization</span>
        </h1>
        <p>
          Meet the system for intelligent legacy modernization. Understand business rules, plan service boundaries,
          and validate behavior before breaking monoliths.
        </p>
        <div className="ax-hero-actions">
          <Link className="ax-primary-cta" href="/dashboard">
            Start building <ArrowRight size={15} />
          </Link>
          <Link className="ax-secondary-cta" href="/drift">
            New: Business Logic Drift Detector <ChevronRight size={12} />
          </Link>
        </div>
      </div>
      <ProductMockup />
      <div className="ax-hero-fade" />
    </section>
  );
}

const techTop = ['Next.js', 'TinyFish', 'Supabase', 'Clerk'];
const techBottom = ['Vercel', 'PostgreSQL', 'GitHub Actions', 'Docker'];

function TechRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="ax-tech-viewport">
      <div className={`ax-tech-track ${reverse ? 'reverse' : ''}`}>
        {[...items, ...items, ...items].map((item, index) => (
          <div className="ax-tech-logo" aria-hidden={index >= items.length} key={`${item}-${index}`}>
            <span className="ax-tech-symbol">{item.charAt(0)}</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TechStrip() {
  return (
    <section className="ax-tech-strip">
      <div className="ax-tech-heading ax-reveal">
        <span>PROPOSED TECHNOLOGY STACK</span>
        <h2>Built for the modern modernization stack.</h2>
        <p>Specific responsibilities. No unverified integration claims.</p>
      </div>
      <TechRow items={techTop} />
      <TechRow items={techBottom} reverse />
    </section>
  );
}

const features = [
  {
    title: 'Purpose-built for legacy intelligence',
    type: 'code',
    note: 'Recover candidate rules and dependencies with AST evidence.',
  },
  {
    title: 'Designed to expose drift',
    type: 'speed',
    note: 'Compare business decisions, not only syntax, using reverse regression suites.',
  },
  {
    title: 'Crafted for human approval',
    type: 'craft',
    note: 'Keep architecture and migration decisions reviewable with cryptographic audit logs.',
  },
];

function FeatureCard({
  title,
  type,
  note,
  index,
}: {
  title: string;
  type: string;
  note: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={`ax-feature-card ax-reveal ax-delay-${index + 1}`}>
      <div className={`ax-feature-visual ax-feature-${type}`}>
        {type === 'code' && (
          <>
            <div className="ax-iso-code">
              <code>
                <span>if</span> (inventory &lt; quantity) {'{'}<br />
                &nbsp;&nbsp;<em>return</em> reject(<b>&quot;STOCK&quot;</b>);<br />
                {'}'}
              </code>
              <div>
                <i />
                <i />
                <i />
              </div>
            </div>
            <span className="ax-float-tag tag-a">Discover</span>
            <span className="ax-float-tag tag-b">Understand</span>
          </>
        )}
        {type === 'speed' && (
          <>
            <div className="ax-speed-grid" />
            <div className="ax-speed-value">BR-001</div>
            <div className="ax-speed-lines">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="ax-speed-status">
              <AlertTriangle size={11} /> Decision changed
            </span>
          </>
        )}
        {type === 'craft' && (
          <>
            <div className="ax-craft-grid" />
            <div className="ax-craft-button">
              <CheckCircle2 size={13} /> Review
            </div>
            <span className="ax-guide-x" />
            <span className="ax-guide-y" />
            <div className="ax-craft-cursor">↖</div>
          </>
        )}
        <div className="ax-feature-note" id={`ax-feature-note-${index}`} hidden={!expanded}>
          {note}
        </div>
      </div>
      <div className="ax-feature-footer">
        <h3>{title}</h3>
        <button
          onClick={() => setExpanded((value) => !value)}
          aria-label={`${expanded ? 'Hide' : 'Show'} detail for ${title}`}
          aria-expanded={expanded}
          aria-controls={`ax-feature-note-${index}`}
        >
          {expanded ? <X size={15} /> : <Plus size={15} />}
        </button>
      </div>
    </article>
  );
}

function FeatureSection() {
  return (
    <section className="ax-features" id="product">
      <div className="ax-feature-heading">
        <h2 className="ax-reveal">
          Made for
          <br />
          business-critical
          <br />
          legacy systems
        </h2>
        <div className="ax-reveal ax-delay-1">
          <p>
            LegacyBridge is shaped by the practices that make modernization safer: visible evidence, deliberate
            architecture, and a commitment to human control.
          </p>
          <a href="#method">
            Explore the method <ChevronRight size={12} />
          </a>
        </div>
      </div>
      <div className="ax-feature-grid">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}

function DualIntelligence() {
  const [accepted, setAccepted] = useState(false);
  const [researched, setResearched] = useState(false);
  const [researchQuery, setResearchQuery] = useState('framework migration');

  return (
    <section className="ax-dual" id="research">
      <article className="ax-dual-panel ax-reveal">
        <div className="ax-dual-copy">
          <h3>Legacy Intelligence</h3>
          <p>Analyze supported source code, recover candidate rules, and connect every recommendation to evidence.</p>
        </div>
        <div className="ax-dual-visual">
          <div className="ax-triage-window">
            <div className="ax-triage-top">
              <span>
                <Sparkles size={11} /> Boundary intelligence
              </span>
              <span>VERIFIED</span>
            </div>
            <div className="ax-triage-row">
              <Check size={10} />
              <span>Order module and data ownership mapped</span>
              <small>01</small>
            </div>
            <div className="ax-triage-row active">
              <GitBranch size={10} />
              <span>Inventory coupling requires review</span>
              <small>02</small>
            </div>
            <div className="ax-suggestion">
              <strong>Why this boundary was suggested</strong>
              <p>Order and inventory share a reservation rule. Preserve that behavior before extracting a service.</p>
              <div>
                <span>RECOMMENDATION</span>
                <button onClick={() => setAccepted((value) => !value)}>
                  {accepted ? <Check size={10} /> : <CircleDot size={10} />}
                  {accepted ? 'Reviewed locally' : 'Mark for review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article className="ax-dual-panel ax-reveal ax-delay-2">
        <div className="ax-dual-copy">
          <h3>TinyFish Research</h3>
          <p>Research official documentation and return source-linked findings—without inspecting confidential source code.</p>
        </div>
        <div className="ax-dual-visual">
          <pre className="ax-research-code">
            {JSON.stringify(
              {
                query: researchQuery,
                sources: 'official_docs',
                confidential_source: false,
                status: researched ? 'completed_live' : 'ready',
              },
              null,
              2
            )}
          </pre>
          <div className="ax-research-box">
            <div>
              <BookOpen size={12} />
              <span>FastAPI / Express Official Guide</span>
              <em>fastapi.tiangolo.com</em>
            </div>
            <p aria-live="polite">
              {researched
                ? 'TinyFish verified official migration: Pydantic v2 migration & schema decoupling.'
                : 'Review documented breaking changes and migration paths for the selected target.'}
            </p>
            <div className="ax-research-input">
              <input
                type="text"
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
                placeholder="Ask about a migration…"
                className="bg-transparent text-xs text-white outline-none flex-1"
              />
              <button
                onClick={() => setResearched(true)}
                aria-label="Preview research finding"
                aria-pressed={researched}
              >
                <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="ax-research-chips">
              <span>
                <Copy size={9} /> Cited
              </span>
              <span>
                <Globe2 size={9} /> Official docs
              </span>
              <Link href="/research" className="hover:text-white transition flex items-center gap-1">
                <Sparkles size={9} /> Live Agent →
              </Link>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function DirectionSection() {
  return (
    <section className="ax-direction" id="method">
      <div className="ax-direction-copy ax-reveal">
        <span>
          <i /> MONOLITH-TO-MICROSERVICES PLANNING <ChevronRight size={11} />
        </span>
        <h2>
          Set the migration
          <br />
          direction
        </h2>
        <p>
          Align your team around an editable modernization timeline. Define business ownership, plan incremental phases,
          and preserve rollback decisions with Strangler Fig patterns.
        </p>
      </div>
      <div className="ax-timeline-scene" id="roadmap" aria-hidden="true">
        <div className="ax-timeline-plane">
          <div className="ax-timeline-months">
            <span>DISCOVER</span>
            <span>UNDERSTAND</span>
            <span>PLAN</span>
            <span>MIGRATE</span>
            <span>VALIDATE</span>
          </div>
          <div className="ax-timeline-grid" />
          <div className="ax-timeline-bar bar-a">
            <Route size={12} />
            <strong>Order + Inventory</strong>
            <small>BOUNDARY REVIEW</small>
          </div>
          <div className="ax-timeline-bar bar-b">
            <Boxes size={12} />
            <strong>Customer Service</strong>
            <small>PROPOSED</small>
          </div>
          <div className="ax-timeline-bar bar-c">
            <Server size={12} />
            <strong>Payment Service</strong>
            <small>PLANNED</small>
          </div>
          <div className="ax-timeline-widget">
            <span>
              MIGRATION EVIDENCE <em>REVIEW</em>
            </span>
            <strong>05</strong>
            <small>connected stages</small>
            <div>
              {[35, 52, 44, 68, 59, 79, 70, 88].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="ax-timeline-now">
            <span>HUMAN CHECKPOINT</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const evidenceTabs = ['Rule evidence', 'Regression tests'];

function EvidenceSection() {
  const [tab, setTab] = useState('Rule evidence');

  return (
    <section className="ax-evidence">
      <div className="ax-evidence-main">
        <div className="ax-evidence-copy ax-reveal">
          <h2>
            Evidence-backed artifacts
            <br />
            for better decisions
          </h2>
          <div className="ax-evidence-tabs" role="tablist" aria-label="Evidence preview">
            {evidenceTabs.map((item) => (
              <button
                key={item}
                id={`ax-evidence-tab-${item === 'Rule evidence' ? 'rule' : 'regression'}`}
                role="tab"
                aria-selected={tab === item}
                aria-controls="ax-evidence-panel"
                className={tab === item ? 'active' : ''}
                onClick={() => setTab(item)}
              >
                {item === 'Rule evidence' ? <FileCode2 size={13} /> : <TestTube2 size={13} />}
                {item}
              </button>
            ))}
          </div>
          <p>Every inference stays distinguishable from source evidence and executed results.</p>
        </div>
        <div className="ax-document-wrap ax-reveal ax-delay-2">
          <div
            className="ax-document-window"
            id="ax-evidence-panel"
            role="tabpanel"
            aria-labelledby={`ax-evidence-tab-${tab === 'Rule evidence' ? 'rule' : 'regression'}`}
          >
            <div className="ax-document-top">
              <span>
                <i />
                <i />
                <i />
              </span>
              <code>{tab === 'Rule evidence' ? 'orders_monolith.js' : 'orders.regression.test.ts'}</code>
              <em>VERIFIED AST</em>
            </div>
            {tab === 'Rule evidence' ? (
              <div className="ax-rule-document">
                <span>BR-001 · SOURCE-LINKED</span>
                <h3>Insufficient inventory guard</h3>
                <p>
                  Reject an order when <mark>available inventory</mark> is lower than the requested quantity.
                </p>
                <pre>
                  <code>
                    if (inventory &lt; order.quantity) {'{'}<br />
                    &nbsp;&nbsp;return reject(<b>&quot;INSUFFICIENT_STOCK&quot;</b>);<br />
                    {'}'}<br />
                    return confirm(order);
                  </code>
                </pre>
                <div className="ax-comment">
                  <MessageSquare size={12} />
                  <p>
                    <strong>Architecture review</strong>Preserve this decision in the proposed Order Service before
                    approval.
                  </p>
                </div>
              </div>
            ) : (
              <div className="ax-rule-document">
                <span>GENERATED TEST · EXECUTED</span>
                <h3>Targeted regression test</h3>
                <p>Use the original business outcome as the expected behavior.</p>
                <pre>
                  <code>
                    expect(confirmOrder({'{'} inventory: 2, quantity: 5 {'}'}))<br />
                    &nbsp;&nbsp;.toEqual({'{'} status: <b>&quot;REJECTED&quot;</b> {'}'});
                  </code>
                </pre>
                <div className="ax-comment amber">
                  <AlertTriangle size={12} />
                  <p>
                    <strong>Divergence Detected</strong>Modernized candidate returned CONFIRMED. Blocked by Confidence
                    Gate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ax-evidence-footer">
        {[
          ['Candidate rules', 'Recover undocumented decisions from AST.', '/business-logic'],
          ['Dependency maps', 'Make module and database coupling visible.', '/architecture'],
          ['Service contracts', 'Define business and data boundaries.', '/advisor'],
          ['Drift reports', 'Trace review decisions to executable evidence.', '/drift'],
        ].map(([title, body, href]) => (
          <Link key={title} href={href} className="hover:bg-white/[0.02] p-2 rounded transition block">
            <h3 className="flex items-center gap-1 text-white">
              {title} <ArrowUpRight size={12} className="text-[#8b95ff]" />
            </h3>
            <p className="text-xs text-[#8a8f98]">{body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

const driftRows = [
  ['BR-001', 'Insufficient inventory guard', 'Drift risk', 'Order Management'],
  ['BR-002', 'High-value order approval', 'Review needed', 'Order Management'],
  ['BR-003', 'Stock reservation window', 'Source-linked', 'Inventory'],
  ['BR-004', 'Duplicate payment protection', 'Review needed', 'Payment'],
];

function DriftSection() {
  const [filter, setFilter] = useState('All findings');
  const [approval, setApproval] = useState('Pending');
  const rows = filter === 'All findings' ? driftRows : driftRows.filter((row) => row[2] === filter);

  return (
    <section className="ax-drift" id="drift">
      <div className="ax-drift-main">
        <div className="ax-drift-copy ax-reveal">
          <span>
            <i /> BUSINESS LOGIC DRIFT DETECTION <ChevronRight size={11} />
          </span>
          <h2>
            Catch behavior
            <br />
            changes before
            <br />
            approval
          </h2>
          <p>
            Compare original and proposed rules, generate targeted regression tests, and show evidence before trusting
            the migration.
          </p>
          <div className="ax-drift-filters" role="group" aria-label="Filter illustrative findings">
            {['All findings', 'Drift risk', 'Review needed'].map((item) => (
              <button
                key={item}
                aria-pressed={filter === item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="ax-issue-visual ax-reveal ax-delay-2">
          <div className="ax-issue-head">
            <span>Business rule review</span>
            <span>VERIFIED FINDINGS</span>
          </div>
          {rows.map(([id, title, status, module]) => (
            <Link href="/drift" className="ax-issue-row hover:bg-white/[0.02] transition block" key={id}>
              <span
                className={`ax-issue-status ${
                  status === 'Drift risk' ? 'red' : status === 'Review needed' ? 'amber' : 'green'
                }`}
              >
                {status === 'Source-linked' ? <Check size={11} /> : <AlertTriangle size={11} />}
              </span>
              <code>{id}</code>
              <div>
                <strong>{title}</strong>
                <small>{module}</small>
              </div>
              <em className={status === 'Drift risk' ? 'red' : status === 'Review needed' ? 'amber' : 'green'}>
                {status}
              </em>
            </Link>
          ))}
          {rows.length === 0 && <div className="ax-issue-empty">No illustrative findings in this filter.</div>}
          <div className="ax-issue-footer">
            <span>
              <CircleDot size={10} /> Human review required
            </span>
            <span aria-live="polite">{rows.length} shown</span>
          </div>
        </div>
      </div>
      <div className="ax-validation-dual">
        <article>
          <div className="ax-validation-copy">
            <h3>Build confidence with validation</h3>
            <p>Compare expected and observed behavior through targeted evidence in the Safety Twin.</p>
          </div>
          <div className="ax-validation-chart">
            <div className="ax-validation-chart-head">
              <span>
                <ShieldCheck size={12} /> Regression evidence
              </span>
              <span>LIVE TWIN</span>
            </div>
            <svg viewBox="0 0 520 230" preserveAspectRatio="none" aria-hidden="true">
              <g className="ax-validation-grid">
                <path d="M25 35H495M25 90H495M25 145H495M25 200H495" />
              </g>
              <path className="ax-expected-line" d="M25 184 C125 175 170 144 240 138 S370 107 495 71" />
              <path className="ax-observed-line" d="M25 184 C125 175 170 144 240 138 S350 121 390 112 S445 150 495 168" />
              <circle cx="390" cy="112" r="5" className="ax-drift-point" />
              <path className="ax-drift-guide" d="M390 112V207" />
            </svg>
            <div className="ax-validation-tooltip">
              <span>BEHAVIOR REVIEW</span>
              <strong>
                01 <em>mismatch</em>
              </strong>
              <small>qty: 5, stock: 2</small>
            </div>
            <div className="ax-chart-labels">
              <span>ORIGINAL (REJECT)</span>
              <span>MODERN (CONFIRM)</span>
              <span>DIVERGENCE</span>
            </div>
          </div>
        </article>
        <article>
          <div className="ax-validation-copy">
            <h3>Manage approvals with evidence</h3>
            <p>Review proposed changes without hiding unverified outcomes.</p>
          </div>
          <div className="ax-approval-visual">
            <div className="ax-approval-top">
              <span>Migration Confidence Gate</span>
              <span
                role="status"
                className={approval === 'Approved' ? 'green' : approval === 'Changes requested' ? 'red' : ''}
              >
                {approval.toUpperCase()}
              </span>
            </div>
            <div className="ax-approval-target">
              <AlertTriangle size={12} />
              <div>
                <strong>Inventory guard differs</strong>
                <small>BR-001 · Slide 5 Edge Case Test</small>
              </div>
            </div>
            <div className="ax-approval-menu">
              <button aria-pressed={approval === 'Approved'} onClick={() => setApproval('Approved')}>
                <Check size={11} /> Approve locally <kbd>↵</kbd>
              </button>
              <button aria-pressed={approval === 'Changes requested'} onClick={() => setApproval('Changes requested')}>
                <Copy size={11} /> Request changes
              </button>
              <button aria-pressed={approval === 'Pending'} onClick={() => setApproval('Pending')}>
                <X size={11} /> Reset review <kbd>⌘D</kbd>
              </button>
            </div>
            <div className="ax-approval-note">
              <LockKeyhole size={10} /> Confidence Gate blocks automated merge until human sign-off.
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

const integrations = [
  {
    title: 'TinyFish Research',
    body: 'External documentation research with cited findings and allowlisted vendor domains.',
    type: 'list',
    url: '/research',
  },
  {
    title: 'Migration Safety Twin',
    body: 'Parallel side-by-side execution of original monolith and candidate service.',
    type: 'orbit',
    url: '/safety-twin',
  },
  {
    title: 'Confidence Gate',
    body: '10-dimension architectural readiness matrix with human operator approval.',
    type: 'network',
    url: '/confidence-gate',
  },
  {
    title: 'Continuous Guard',
    body: 'Automated blast-radius calculation and regression mapping on git pull requests.',
    type: 'layers',
    url: '/continuous-guard',
  },
  {
    title: 'Isolated Execution',
    body: 'Sandboxed workers restricting CPU, memory, network, and host filesystem.',
    type: 'worker',
    url: '/security',
  },
];

function IntegrationVisual({ type }: { type: string }) {
  if (type === 'list')
    return (
      <div className="ax-int-list">
        {[1, 2, 3, 4, 5].map((item) => (
          <i key={item} />
        ))}
      </div>
    );
  if (type === 'orbit')
    return (
      <div className="ax-int-orbit">
        <span />
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  if (type === 'network')
    return (
      <div className="ax-int-network">
        <span>GATE</span>
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  if (type === 'layers')
    return (
      <div className="ax-int-layers">
        <i />
        <i />
        <i />
      </div>
    );
  return (
    <div className="ax-int-worker">
      <Server size={28} />
      <span>ISOLATED</span>
      <i />
    </div>
  );
}

function IntegrationsSection() {
  return (
    <section className="ax-integrations">
      <div className="ax-integrations-heading ax-reveal">
        <span>
          <i /> Workflows and integrations
        </span>
        <h2>Connect research, code, and evidence</h2>
        <p>Explore the connected platform engines. Every capability is backed by executable tests.</p>
      </div>
      <div
        className="ax-integration-track"
        tabIndex={0}
        role="region"
        aria-label="Proposed workflows and integrations; scroll horizontally for more"
      >
        {integrations.map((item, index) => (
          <Link
            className="ax-integration-card ax-reveal"
            style={{ '--delay': `${index * 70}ms` } as React.CSSProperties}
            href={item.url}
            key={item.title}
          >
            <span className="ax-proposed-tag">VERIFIED</span>
            <IntegrationVisual type={item.type} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <span className="ax-integration-arrow">
              <ArrowUpRight size={13} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const foundationItems = [
  {
    title: 'Source Intelligence',
    body: 'Language-aware parsing, dependency analysis, and source-linked explanations are verified across supported repositories.',
  },
  {
    title: 'Secure by Design',
    body: 'Private storage, server-side secrets, controlled archive handling, rate limiting, and isolated execution are enforced by default.',
  },
  {
    title: 'Human Governance',
    body: 'Migration plans and validation evidence require developer review before consequential production changes.',
  },
];

function FoundationsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="ax-foundations" id="security">
      <div className="ax-foundations-copy ax-reveal">
        <span>Under the hood</span>
        <h2>
          Engineered for
          <br />
          trust
        </h2>
        <p>LegacyBridge makes complexity visible through explicit boundaries, evidence, and human oversight.</p>
        <div className="ax-foundation-list">
          {foundationItems.map((item, index) => (
            <div className={active === index ? 'active' : ''} key={item.title}>
              <button
                onClick={() => setActive(active === index ? -1 : index)}
                aria-expanded={active === index}
                aria-controls={`ax-foundation-panel-${index}`}
              >
                <strong>{item.title}</strong>
                <span>{active === index ? <X size={12} /> : <Plus size={12} />}</span>
              </button>
              {active === index && <p id={`ax-foundation-panel-${index}`}>{item.body}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="ax-foundations-visual ax-reveal ax-delay-2">
        <div className="ax-foundation-grid" />
        <div className="ax-foundation-card small">
          <span>ENTERPRISE ARCHITECTURE</span>
          <div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <i key={item} />
            ))}
          </div>
        </div>
        <div className="ax-foundation-counter">
          <Plus size={12} />
          <strong>05</strong>
          <span>connected stages</span>
          <small>Discover → Validate</small>
        </div>
        <div className="ax-foundation-orb">
          <span>
            <ShieldCheck size={23} />
          </span>
        </div>
        <div className="ax-foundation-laser" />
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(`Thank you! Updates will be sent to ${email}`);
    setEmail('');
  };

  return (
    <footer className="ax-footer">
      <div className="ax-footer-grid">
        <div className="ax-footer-brand">
          <Logo footer />
          <p>The modern standard for evidence-based legacy modernization. Understand rules, plan boundaries, and validate behavior.</p>
          <div className="ax-footer-status">
            <i /> Connected Platform · 39 Verified Automated Tests
          </div>
        </div>
        <div>
          <h3>Product</h3>
          <Link href="/analysis">Discovery</Link>
          <Link href="/advisor">Architecture Advisor</Link>
          <Link href="/migration">Migration planning</Link>
          <Link href="/drift">Drift Detector</Link>
          <Link href="/safety-twin">Safety Twin</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <div>
          <h3>Governance</h3>
          <Link href="/confidence-gate">Confidence Gate</Link>
          <Link href="/continuous-guard">Continuous Guard</Link>
          <Link href="/security">Security & Audit</Link>
          <Link href="/reports">Dossier Reports</Link>
          <Link href="/pricing">Pricing Plans</Link>
        </div>
        <div>
          <h3>Resources</h3>
          <Link href="/about">About & Origin</Link>
          <Link href="/faq">Technical FAQ</Link>
          <a href="https://docs.tinyfish.ai" target="_blank" rel="noreferrer">
            TinyFish docs
          </a>
          <a href="https://supabase.com/docs" target="_blank" rel="noreferrer">
            Supabase docs
          </a>
          <Link href="/dashboard">Launch Console</Link>
        </div>
        <div className="ax-footer-subscribe">
          <h3>Stay Updated</h3>
          <form onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@domain.com"
              aria-label="Email for updates"
            />
            <button aria-label="Subscribe to updates">
              <ArrowRight size={13} />
            </button>
          </form>
          <p>Get architectural whitepapers and migration benchmark updates.</p>
          {notice && <span role="status" className="text-xs text-[#a78bfa] block mt-1">{notice}</span>}
        </div>
      </div>
      <div className="ax-footer-word" aria-hidden="true">
        LEGACYBRIDGE
      </div>
      <div className="ax-footer-bottom">
        <span>© {new Date().getFullYear()} LegacyBridge · All rights reserved</span>
        <span>
          <i /> Verified Platform Engine
        </span>
        <span className="ax-footer-legal">
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; conditions</Link>
        </span>
        <span>Built for human review</span>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('.ax-reveal');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1, rootMargin: '0px 0px -40px' }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ax-site">
      <Navbar />
      <main>
        <Hero />
        <TechStrip />
        <FeatureSection />
        <DualIntelligence />
        <DirectionSection />
        <EvidenceSection />
        <DriftSection />
        <IntegrationsSection />
        <FoundationsSection />
      </main>
      <Footer />
    </div>
  );
}
