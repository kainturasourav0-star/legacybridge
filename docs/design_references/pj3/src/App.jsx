import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BookOpen, Boxes, Braces, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleDot, Clock3, Code2, Copy,
  Database, FileCheck2, FileCode2, FileSearch, FileText, GitBranch, Globe2,
  Layers3, Loader2, LockKeyhole, Menu, MessageSquare, Network, Play, Plus,
  Route, Search, Server, ShieldCheck, Sparkles, TestTube2, X,
} from 'lucide-react';
import BridgeMark from './BridgeMark';

const navItems = [
  ['Product', '#product'], ['Method', '#method'], ['Security', '#security'],
  ['Research', '#research'], ['Roadmap', '#roadmap'],
];

function Logo({ footer = false }) {
  return <a className={`ax-logo ${footer ? 'ax-logo-footer' : ''}`} href="#top" aria-label="LegacyBridge home"><span><BridgeMark size={footer ? 25 : 22} /></span><strong>LegacyBridge</strong></a>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <header className={`ax-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <Logo />
      <nav className="ax-nav-pill" aria-label="Main navigation">{navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav>
      <div className="ax-nav-auth"><Link to="/login">Log in</Link><Link className="ax-signup" to="/sign-up">Sign up</Link></div>
      <button className="ax-menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <div className={`ax-mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={open ? undefined : ''}>{navItems.map(([label, href]) => <a key={label} href={href} onClick={close}>{label}<ArrowRight size={15} /></a>)}<Link to="/login" onClick={close}>Log in<ArrowRight size={15} /></Link><Link className="ax-mobile-signup" to="/sign-up" onClick={close}>Sign up<ArrowUpRight size={15} /></Link></div>
    </header>
  );
}

function ProductMockup() {
  const card = useRef(null);
  const move = (event) => {
    if (!card.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    card.current.style.setProperty('--ax-ry', `${x * 1.4}deg`);
  };
  const leave = () => card.current?.style.setProperty('--ax-ry', '0deg');
  return (
    <div className="ax-product-stage" onMouseMove={move} onMouseLeave={leave}>
      <div className="ax-product-window" ref={card}>
        <div className="ax-window-top"><span className="ax-window-dots"><i /><i /><i /></span><div className="ax-window-address"><LockKeyhole size={9} /> legacybridge <em>/</em> overview</div><span className="ax-sample-pill"><i /> SAMPLE</span></div>
        <div className="ax-window-body">
          <aside className="ax-mock-sidebar">
            <div className="active"><Layers3 size={12} /> Overview</div>
            <div><FileSearch size={12} /> Discovery</div>
            <div><Braces size={12} /> Business rules <span>24</span></div>
            <div><Route size={12} /> Migration</div>
            <div><ShieldCheck size={12} /> Validation <span>3</span></div>
            <small>WORKSPACE</small>
            <p><i /> Order management</p>
            <div className="ax-mock-system"><span><i /> UI prototype</span><small>Illustrative states</small></div>
          </aside>
          <main className="ax-mock-main">
            <div className="ax-mock-heading"><div><span>DEPENDENCY INTELLIGENCE</span><strong>38 <em>relationships</em></strong></div><div className="ax-mock-tabs"><span className="active">Source map</span><span>Rules</span></div></div>
            <div className="ax-mock-chart">
              <svg viewBox="0 0 760 200" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="axArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7379ec" stopOpacity=".22" /><stop offset="1" stopColor="#7379ec" stopOpacity="0" /></linearGradient><linearGradient id="axLine" x1="0" x2="1"><stop stopColor="#434a98" /><stop offset=".55" stopColor="#9299ff" /><stop offset="1" stopColor="#656ee0" /></linearGradient></defs>
                <g className="ax-chart-grid"><path d="M0 35H760M0 90H760M0 145H760M0 195H760" /></g>
                <path className="ax-chart-area" d="M0 165 C80 155 115 128 170 139 S270 160 330 117 S430 51 490 78 S585 127 645 93 S720 61 760 69 L760 200 L0 200Z" />
                <path className="ax-chart-line" d="M0 165 C80 155 115 128 170 139 S270 160 330 117 S430 51 490 78 S585 127 645 93 S720 61 760 69" />
                <circle cx="490" cy="78" r="4" className="ax-chart-point" />
              </svg>
              <div className="ax-chart-tooltip">ILLUSTRATIVE</div>
            </div>
            <div className="ax-mock-priority"><span>BUSINESS RULE REVIEW</span><span>View all</span></div>
            <div className="ax-mock-rows">
              <div><span className="ax-row-icon red"><AlertTriangle size={10} /></span><code>BR-001</code><strong>Insufficient inventory guard</strong><span className="ax-row-tag red">Drift risk</span><span className="ax-row-avatar">OR</span></div>
              <div><span className="ax-row-icon violet"><Sparkles size={10} /></span><code>BR-002</code><strong>High-value order approval</strong><span className="ax-row-tag">Review</span><span className="ax-row-avatar">AI</span></div>
              <div><span className="ax-row-icon green"><Check size={10} /></span><code>BR-003</code><strong>Stock reservation window</strong><span className="ax-row-tag green">Source-linked</span><span className="ax-row-avatar">IN</span></div>
            </div>
          </main>
        </div>
        <div className="ax-mock-search"><Search size={12} /><span>Search rules, services, and evidence…</span><kbd>⌘ K</kbd><p><span>↵</span> Create migration review</p></div>
        <div className="ax-mock-insight"><span><Sparkles size={10} /> RESEARCH INSIGHT</span><p>Official documentation linked for the selected framework version.</p><div><strong>Source-linked finding</strong><em>Review source <ArrowRight size={9} /></em></div></div>
        <div className="ax-mock-deploy"><span><CheckCircle2 size={11} /> Human review</span><strong>Migration plan</strong><div><i /></div><small>Awaiting approval · simulated</small></div>
        <div className="ax-mock-cursor"><span>LegacyBridge</span></div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="ax-hero" id="top">
      <div className="ax-hero-grid" /><div className="ax-hero-beam" /><div className="ax-hero-particles" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ '--x': `${44 + (index * 17 % 15)}%`, '--y': `${8 + (index * 29 % 64)}%`, '--d': `${-(index % 9) * .47}s` }} />)}</div>
      <div className="ax-hero-copy"><h1>The new standard for<br /><span>legacy modernization</span></h1><p>Meet the system for intelligent legacy modernization. Understand business rules, plan service boundaries, and validate behavior.</p><div className="ax-hero-actions"><Link className="ax-primary-cta" to="/sign-up">Start building <ArrowRight size={15} /></Link><a className="ax-secondary-cta" href="#drift">New: Business Logic Drift Detector <ChevronRight size={12} /></a></div></div>
      <ProductMockup />
      <div className="ax-hero-fade" />
    </section>
  );
}

const techTop = ['Next.js', 'TinyFish', 'Supabase', 'Clerk'];
const techBottom = ['Vercel', 'PostgreSQL', 'GitHub Actions', 'Docker'];
function TechRow({ items, reverse = false }) {
  return <div className="ax-tech-viewport"><div className={`ax-tech-track ${reverse ? 'reverse' : ''}`}>{[...items, ...items, ...items].map((item, index) => <div className="ax-tech-logo" aria-hidden={index >= items.length} key={`${item}-${index}`}><span className="ax-tech-symbol">{item.charAt(0)}</span>{item}</div>)}</div></div>;
}
function TechStrip() {
  return <section className="ax-tech-strip"><div className="ax-tech-heading ax-reveal"><span>PROPOSED TECHNOLOGY STACK</span><h2>Built for the modern modernization stack.</h2><p>Specific responsibilities. No unverified integration claims.</p></div><TechRow items={techTop} /><TechRow items={techBottom} reverse /></section>;
}

const features = [
  { title: 'Purpose-built for legacy intelligence', type: 'code', note: 'Recover candidate rules and dependencies with evidence.' },
  { title: 'Designed to expose drift', type: 'speed', note: 'Compare business decisions, not only syntax.' },
  { title: 'Crafted for human approval', type: 'craft', note: 'Keep architecture and migration decisions reviewable.' },
];
function FeatureCard({ title, type, note, index }) {
  const [expanded, setExpanded] = useState(false);
  return <article className={`ax-feature-card ax-reveal ax-delay-${index + 1}`}>
    <div className={`ax-feature-visual ax-feature-${type}`}>
      {type === 'code' && <><div className="ax-iso-code"><code><span>if</span> (inventory &lt; quantity) {'{'}<br />&nbsp;&nbsp;<em>return</em> reject(<b>"STOCK"</b>);<br />{'}'}</code><div><i /><i /><i /></div></div><span className="ax-float-tag tag-a">Discover</span><span className="ax-float-tag tag-b">Understand</span></>}
      {type === 'speed' && <><div className="ax-speed-grid" /><div className="ax-speed-value">BR-001</div><div className="ax-speed-lines"><i /><i /><i /><i /><i /></div><span className="ax-speed-status"><AlertTriangle size={11} /> Decision changed</span></>}
      {type === 'craft' && <><div className="ax-craft-grid" /><div className="ax-craft-button"><CheckCircle2 size={13} /> Review</div><span className="ax-guide-x" /><span className="ax-guide-y" /><div className="ax-craft-cursor">↖</div></>}
      <div className="ax-feature-note" id={`ax-feature-note-${index}`} hidden={!expanded}>{note}</div>
    </div>
    <div className="ax-feature-footer"><h3>{title}</h3><button onClick={() => setExpanded((value) => !value)} aria-label={`${expanded ? 'Hide' : 'Show'} detail for ${title}`} aria-expanded={expanded} aria-controls={`ax-feature-note-${index}`}>{expanded ? <X size={15} /> : <Plus size={15} />}</button></div>
  </article>;
}
function FeatureSection() {
  return <section className="ax-features" id="product"><div className="ax-feature-heading"><h2 className="ax-reveal">Made for<br />business-critical<br />legacy systems</h2><div className="ax-reveal ax-delay-1"><p>LegacyBridge is shaped by the practices that make modernization safer: visible evidence, deliberate architecture, and a commitment to human control.</p><a href="#method">Explore the method <ChevronRight size={12} /></a></div></div><div className="ax-feature-grid">{features.map((feature, index) => <FeatureCard key={feature.title} {...feature} index={index} />)}</div></section>;
}

function DualIntelligence() {
  const [accepted, setAccepted] = useState(false);
  const [researched, setResearched] = useState(false);
  return <section className="ax-dual" id="research">
    <article className="ax-dual-panel ax-reveal"><div className="ax-dual-copy"><h3>Legacy Intelligence</h3><p>Analyze supported source code, recover candidate rules, and connect every recommendation to evidence.</p></div><div className="ax-dual-visual"><div className="ax-triage-window"><div className="ax-triage-top"><span><Sparkles size={11} /> Boundary intelligence</span><span>ILLUSTRATIVE</span></div><div className="ax-triage-row"><Check size={10} /><span>Order module and data ownership mapped</span><small>01</small></div><div className="ax-triage-row active"><GitBranch size={10} /><span>Inventory coupling requires review</span><small>02</small></div><div className="ax-suggestion"><strong>Why this boundary was suggested</strong><p>Order and inventory share a reservation rule. Preserve that behavior before extracting a service.</p><div><span>RECOMMENDATION</span><button onClick={() => setAccepted((value) => !value)}>{accepted ? <Check size={10} /> : <CircleDot size={10} />}{accepted ? 'Reviewed locally' : 'Mark for review'}</button></div></div></div></div></article>
    <article className="ax-dual-panel ax-reveal ax-delay-2"><div className="ax-dual-copy"><h3>TinyFish Research</h3><p>Research official documentation and return source-linked findings—without inspecting confidential source code.</p></div><div className="ax-dual-visual"><pre className="ax-research-code">{`{
  "query": "framework migration",
  "sources": "official_docs",
  "confidential_source": false,
  "result": "cited_recommendation"
}`}</pre><div className="ax-research-box"><div><BookOpen size={12} /><span>Next.js documentation</span><em>nextjs.org</em></div><p aria-live="polite">{researched ? 'Illustrative cited finding restored. No external request was sent.' : 'Review documented breaking changes for the selected target version.'}</p><div className="ax-research-input"><span>Ask about a migration…</span><button onClick={() => setResearched(true)} aria-label="Preview research finding" aria-pressed={researched}><ArrowUpRight size={12} /></button></div><div className="ax-research-chips"><span><Copy size={9} /> Cited</span><span><Globe2 size={9} /> Official docs</span><span><Sparkles size={9} /> Review</span></div></div></div></article>
  </section>;
}

function DirectionSection() {
  return <section className="ax-direction" id="method"><div className="ax-direction-copy ax-reveal"><span><i /> MONOLITH-TO-MICROSERVICES PLANNING <ChevronRight size={11} /></span><h2>Set the migration<br />direction</h2><p>Align your team around an editable modernization timeline. Define business ownership, plan incremental phases, and preserve rollback decisions.</p></div><div className="ax-timeline-scene" id="roadmap" aria-hidden="true"><div className="ax-timeline-plane"><div className="ax-timeline-months"><span>DISCOVER</span><span>UNDERSTAND</span><span>PLAN</span><span>MIGRATE</span><span>VALIDATE</span></div><div className="ax-timeline-grid" /><div className="ax-timeline-bar bar-a"><Route size={12} /><strong>Order + Inventory</strong><small>BOUNDARY REVIEW</small></div><div className="ax-timeline-bar bar-b"><Boxes size={12} /><strong>Customer Service</strong><small>PROPOSED</small></div><div className="ax-timeline-bar bar-c"><Server size={12} /><strong>Payment Service</strong><small>PLANNED</small></div><div className="ax-timeline-widget"><span>MIGRATION EVIDENCE <em>REVIEW</em></span><strong>05</strong><small>connected stages</small><div>{[35,52,44,68,59,79,70,88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div><div className="ax-timeline-now"><span>HUMAN CHECKPOINT</span></div></div></div></section>;
}

const evidenceTabs = ['Rule evidence', 'Regression tests'];
function EvidenceSection() {
  const [tab, setTab] = useState('Rule evidence');
  return <section className="ax-evidence"><div className="ax-evidence-main"><div className="ax-evidence-copy ax-reveal"><h2>Evidence-backed artifacts<br />for better decisions</h2><div className="ax-evidence-tabs" role="tablist" aria-label="Evidence preview">{evidenceTabs.map((item) => <button key={item} id={`ax-evidence-tab-${item === 'Rule evidence' ? 'rule' : 'regression'}`} role="tab" aria-selected={tab === item} aria-controls="ax-evidence-panel" className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item === 'Rule evidence' ? <FileCode2 size={13} /> : <TestTube2 size={13} />}{item}</button>)}</div><p>Every inference stays distinguishable from source evidence and executed results.</p></div><div className="ax-document-wrap ax-reveal ax-delay-2"><div className="ax-document-window" id="ax-evidence-panel" role="tabpanel" aria-labelledby={`ax-evidence-tab-${tab === 'Rule evidence' ? 'rule' : 'regression'}`}><div className="ax-document-top"><span><i /><i /><i /></span><code>{tab === 'Rule evidence' ? 'confirm.ts' : 'confirm.regression.test.ts'}</code><em>ILLUSTRATIVE</em></div>{tab === 'Rule evidence' ? <div className="ax-rule-document"><span>BR-001 · SOURCE-LINKED</span><h3>Insufficient inventory guard</h3><p>Reject an order when <mark>available inventory</mark> is lower than the requested quantity.</p><pre><code>if (inventory &lt; order.quantity) {'{'}<br />&nbsp;&nbsp;return reject(<b>"INSUFFICIENT_STOCK"</b>);<br />{'}'}<br />return confirm(order);</code></pre><div className="ax-comment"><MessageSquare size={12} /><p><strong>Architecture review</strong>Preserve this decision in the proposed Order Service before approval.</p></div></div> : <div className="ax-rule-document"><span>GENERATED TEST · NOT EXECUTED</span><h3>Targeted regression test</h3><p>Use the original business outcome as the expected behavior.</p><pre><code>expect(confirmOrder({'{'} inventory: 2, quantity: 5 {'}'}))<br />&nbsp;&nbsp;.toEqual({'{'} status: <b>"REJECTED"</b> {'}'});</code></pre><div className="ax-comment amber"><AlertTriangle size={12} /><p><strong>Execution boundary</strong>Run untrusted code only in an isolated worker. This preview did not execute a test.</p></div></div>}</div></div></div><div className="ax-evidence-footer">{[['Candidate rules', 'Recover undocumented decisions.'], ['Dependency maps', 'Make module coupling visible.'], ['Service contracts', 'Define business and data boundaries.'], ['Drift reports', 'Trace review decisions to evidence.']].map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}</div></section>;
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
  return <section className="ax-drift" id="drift"><div className="ax-drift-main"><div className="ax-drift-copy ax-reveal"><span><i /> BUSINESS LOGIC DRIFT DETECTION <ChevronRight size={11} /></span><h2>Catch behavior<br />changes before<br />approval</h2><p>Compare original and proposed rules, generate targeted regression tests, and show evidence before trusting the migration.</p><div className="ax-drift-filters" role="group" aria-label="Filter illustrative findings">{['All findings', 'Drift risk', 'Review needed'].map((item) => <button key={item} aria-pressed={filter === item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="ax-issue-visual ax-reveal ax-delay-2"><div className="ax-issue-head"><span>Business rule review</span><span>ILLUSTRATIVE</span></div>{rows.map(([id, title, status, module]) => <div className="ax-issue-row" key={id}><span className={`ax-issue-status ${status === 'Drift risk' ? 'red' : status === 'Review needed' ? 'amber' : 'green'}`}>{status === 'Source-linked' ? <Check size={11} /> : <AlertTriangle size={11} />}</span><code>{id}</code><div><strong>{title}</strong><small>{module}</small></div><em className={status === 'Drift risk' ? 'red' : status === 'Review needed' ? 'amber' : 'green'}>{status}</em></div>)}{rows.length === 0 && <div className="ax-issue-empty">No illustrative findings in this filter.</div>}<div className="ax-issue-footer"><span><CircleDot size={10} /> Human review required</span><span aria-live="polite">{rows.length} shown</span></div></div></div><div className="ax-validation-dual"><article><div className="ax-validation-copy"><h3>Build confidence with validation</h3><p>Compare expected and observed behavior through targeted evidence.</p></div><div className="ax-validation-chart"><div className="ax-validation-chart-head"><span><ShieldCheck size={12} /> Regression evidence</span><span>SIMULATED</span></div><svg viewBox="0 0 520 230" preserveAspectRatio="none" aria-hidden="true"><g className="ax-validation-grid"><path d="M25 35H495M25 90H495M25 145H495M25 200H495" /></g><path className="ax-expected-line" d="M25 184 C125 175 170 144 240 138 S370 107 495 71" /><path className="ax-observed-line" d="M25 184 C125 175 170 144 240 138 S350 121 390 112 S445 150 495 168" /><circle cx="390" cy="112" r="5" className="ax-drift-point" /><path className="ax-drift-guide" d="M390 112V207" /></svg><div className="ax-validation-tooltip"><span>BEHAVIOR REVIEW</span><strong>01 <em>mismatch</em></strong><small>Illustrative · not executed</small></div><div className="ax-chart-labels"><span>ORIGINAL</span><span>PROPOSED</span><span>REVIEW</span></div></div></article><article><div className="ax-validation-copy"><h3>Manage approvals with evidence</h3><p>Review proposed changes without hiding unverified outcomes.</p></div><div className="ax-approval-visual"><div className="ax-approval-top"><span>Migration review</span><span role="status" className={approval === 'Approved' ? 'green' : approval === 'Changes requested' ? 'red' : ''}>{approval.toUpperCase()}</span></div><div className="ax-approval-target"><AlertTriangle size={12} /><div><strong>Inventory guard differs</strong><small>BR-001 · illustrative comparison</small></div></div><div className="ax-approval-menu"><button aria-pressed={approval === 'Approved'} onClick={() => setApproval('Approved')}><Check size={11} /> Approve locally <kbd>↵</kbd></button><button aria-pressed={approval === 'Changes requested'} onClick={() => setApproval('Changes requested')}><Copy size={11} /> Request changes</button><button aria-pressed={approval === 'Pending'} onClick={() => setApproval('Pending')}><X size={11} /> Reset review <kbd>⌘D</kbd></button></div><div className="ax-approval-note"><LockKeyhole size={10} /> No source code or migration was changed.</div></div></article></div></section>;
}

const integrations = [
  { title: 'TinyFish Research', body: 'External documentation research with cited findings.', type: 'list', url: 'https://docs.tinyfish.ai/research-api' },
  { title: 'LegacyBridge Intelligence', body: 'Proposed source analysis, business-rule recovery, and migration planning.', type: 'orbit', url: '#method' },
  { title: 'Supabase Evidence', body: 'Proposed private project data and traceable reports.', type: 'network', url: 'https://supabase.com/docs' },
  { title: 'GitHub Actions', body: 'Proposed repository workflows for supported checks.', type: 'layers', url: 'https://docs.github.com/actions' },
  { title: 'Isolated Workers', body: 'Required boundary for executing untrusted code.', type: 'worker', url: 'https://docs.docker.com/' },
];
function IntegrationVisual({ type }) {
  if (type === 'list') return <div className="ax-int-list">{[1,2,3,4,5].map((item) => <i key={item} />)}</div>;
  if (type === 'orbit') return <div className="ax-int-orbit"><span /><i /><i /><i /><i /></div>;
  if (type === 'network') return <div className="ax-int-network"><span>DB</span><i /><i /><i /><i /></div>;
  if (type === 'layers') return <div className="ax-int-layers"><i /><i /><i /></div>;
  return <div className="ax-int-worker"><Server size={28} /><span>ISOLATED</span><i /></div>;
}
function IntegrationsSection() {
  return <section className="ax-integrations"><div className="ax-integrations-heading ax-reveal"><span><i /> Workflows and integrations</span><h2>Connect research, code, and evidence</h2><p>Explore the proposed architecture. Every external capability remains explicitly labeled until it is implemented and verified.</p></div><div className="ax-integration-track" tabIndex={0} role="region" aria-label="Proposed workflows and integrations; scroll horizontally for more">{integrations.map((item, index) => <a className="ax-integration-card ax-reveal" style={{ '--delay': `${index * 70}ms` }} href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} rel={item.url.startsWith('http') ? 'noreferrer' : undefined} key={item.title}><span className="ax-proposed-tag">PROPOSED</span><IntegrationVisual type={item.type} /><div><h3>{item.title}</h3><p>{item.body}</p></div><span className="ax-integration-arrow"><ArrowUpRight size={13} /></span></a>)}</div></section>;
}

const foundationItems = [
  { title: 'Source Intelligence', body: 'Language-aware parsing, dependency analysis, and source-linked explanations are proposed for supported repositories.' },
  { title: 'Secure by Design', body: 'Private storage, server-side secrets, controlled archive handling, and isolated execution are architectural requirements—not verified claims.' },
  { title: 'Human Governance', body: 'Migration plans and validation evidence require developer review before consequential changes.' },
];
function FoundationsSection() {
  const [active, setActive] = useState(0);
  return <section className="ax-foundations" id="security"><div className="ax-foundations-copy ax-reveal"><span>Under the hood</span><h2>Engineered for<br />trust</h2><p>LegacyBridge makes complexity visible through explicit boundaries, evidence, and human oversight.</p><div className="ax-foundation-list">{foundationItems.map((item, index) => <div className={active === index ? 'active' : ''} key={item.title}><button onClick={() => setActive(active === index ? -1 : index)} aria-expanded={active === index} aria-controls={`ax-foundation-panel-${index}`}><strong>{item.title}</strong><span>{active === index ? <X size={12} /> : <Plus size={12} />}</span></button>{active === index && <p id={`ax-foundation-panel-${index}`}>{item.body}</p>}</div>)}</div></div><div className="ax-foundations-visual ax-reveal ax-delay-2"><div className="ax-foundation-grid" /><div className="ax-foundation-card small"><span>PROPOSED ARCHITECTURE</span><div>{[1,2,3,4,5,6,7,8].map((item) => <i key={item} />)}</div></div><div className="ax-foundation-counter"><Plus size={12} /><strong>05</strong><span>connected stages</span><small>Discover → Validate</small></div><div className="ax-foundation-orb"><span><ShieldCheck size={23} /></span></div><div className="ax-foundation-laser" /></div></section>;
}

function Footer() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const submit = (event) => { event.preventDefault(); setNotice('Preview only — no subscription or email was sent.'); };
  return <footer className="ax-footer"><div className="ax-footer-grid"><div className="ax-footer-brand"><Logo footer /><p>The modern standard for evidence-based legacy modernization. Understand rules, plan boundaries, and validate behavior.</p><div className="ax-footer-status"><i /> UI prototype · illustrative states</div></div><div><h3>Product</h3><a href="#product">Discovery</a><a href="#method">Migration planning</a><a href="#drift">Drift Detector</a><a href="#research">Research</a><Link to="/dashboard">Dashboard</Link></div><div><h3>Method</h3><a href="#method">Workflow</a><a href="#security">Security</a><a href="#security">Architecture</a><a href="#roadmap">Roadmap</a><Link to="/sign-up">Get started</Link></div><div><h3>Resources</h3><Link to="/dashboard">Implementation status</Link><a href="https://docs.tinyfish.ai/research-api" target="_blank" rel="noreferrer">TinyFish docs</a><a href="https://nextjs.org/docs" target="_blank" rel="noreferrer">Next.js docs</a><a href="https://supabase.com/docs" target="_blank" rel="noreferrer">Supabase docs</a><Link to="/login">Log in</Link></div><div className="ax-footer-subscribe"><h3>Subscribe</h3><form onSubmit={submit}><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@domain.com" aria-label="Email for prototype updates" /><button aria-label="Preview subscription"><ArrowRight size={13} /></button></form><p>Preview the subscription interaction. No data is transmitted.</p>{notice && <span role="status">{notice}</span>}</div></div><div className="ax-footer-word" aria-hidden="true">LEGACYBRIDGE</div><div className="ax-footer-bottom"><span>© 2026 LegacyBridge · Hackathon prototype</span><span><i /> All states illustrative</span><span className="ax-footer-legal"><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms &amp; conditions</Link></span><span>Built for human review</span></div></footer>;
}

export default function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('.ax-reveal');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { elements.forEach((element) => element.classList.add('is-visible')); return undefined; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.1, rootMargin: '0px 0px -40px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return <div className="ax-site"><Navbar /><main><Hero /><TechStrip /><FeatureSection /><DualIntelligence /><DirectionSection /><EvidenceSection /><DriftSection /><IntegrationsSection /><FoundationsSection /></main><Footer /></div>;
}
