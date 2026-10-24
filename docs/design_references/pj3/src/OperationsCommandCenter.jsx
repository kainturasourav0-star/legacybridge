import { UserButton } from '@clerk/react';
import {
  AlertTriangle, ArrowRight, ArrowUpRight, Bell, BookOpen, Boxes, Braces,
  Check, CheckCircle2, ChevronRight, CircleDot, Clock3, Code2, Database,
  Download, ExternalLink, FileCheck2, FileCode2, FileJson2, FileSearch,
  FileText, FolderGit2, GitBranch, Globe2, Info, Layers3, LayoutDashboard,
  Loader2, LockKeyhole, Menu, Network, Play, RefreshCw, Route, Search,
  Server, ShieldCheck, Sparkles, TestTube2, X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BridgeMark from './BridgeMark';

const navigation = [
  { label: 'MODERNIZATION WORKSPACE', items: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'discovery', label: 'Discovery', icon: FileSearch },
    { id: 'rules', label: 'Business rules', icon: Braces, count: 24 },
    { id: 'migration', label: 'Migration plan', icon: Route },
    { id: 'validation', label: 'Validation', icon: ShieldCheck, count: 3 },
  ] },
  { label: 'INTELLIGENCE & EVIDENCE', items: [
    { id: 'research', label: 'Research agent', icon: Globe2 },
    { id: 'reports', label: 'Evidence reports', icon: FileText },
  ] },
];

const viewMeta = {
  overview: { title: 'Modernization overview', description: 'Order management monolith · understand the system before changing its architecture.' },
  discovery: { title: 'Discovery & dependency intelligence', description: 'Inspect illustrative modules, relationships, data ownership, and analysis evidence.' },
  rules: { title: 'Business rule inventory', description: 'Review candidate rules with source-linked evidence and targeted regression tests.' },
  migration: { title: 'Migration planning', description: 'Evaluate proposed service boundaries, data ownership, phases, and rollback decisions.' },
  validation: { title: 'Business Logic Drift Detector', description: 'Compare original and proposed behavior before trusting a migration.' },
  research: { title: 'TinyFish migration research', description: 'Preview source-linked external documentation research, separated from source analysis.' },
  reports: { title: 'Evidence reports', description: 'Download clearly labeled illustrative reports for the hackathon workflow.' },
};

const workflow = [
  { id: 'discovery', number: '01', title: 'DISCOVER', caption: 'Authorized source' },
  { id: 'discovery', number: '02', title: 'UNDERSTAND', caption: 'Rules + dependencies' },
  { id: 'migration', number: '03', title: 'PLAN', caption: 'Editable boundaries' },
  { id: 'migration', number: '04', title: 'MIGRATE', caption: 'Proposed scaffolds' },
  { id: 'validation', number: '05', title: 'VALIDATE', caption: 'Behavior evidence' },
];

const modules = [
  { name: 'Order Management', type: 'Core module', dependencies: 11, rules: 9, ownership: 'Orders + workflow', risk: 'High', source: 'src/orders/**' },
  { name: 'Inventory Management', type: 'Core module', dependencies: 8, rules: 6, ownership: 'Stock state', risk: 'High', source: 'src/inventory/**' },
  { name: 'Customer Management', type: 'Domain module', dependencies: 5, rules: 4, ownership: 'Customer records', risk: 'Medium', source: 'src/customers/**' },
  { name: 'Payment Processing', type: 'Integration', dependencies: 9, rules: 5, ownership: 'Payment records', risk: 'Review', source: 'src/payments/**' },
  { name: 'Web UI', type: 'Experience', dependencies: 5, rules: 0, ownership: 'No domain data', risk: 'Low', source: 'src/web/**' },
];

const rules = [
  {
    id: 'BR-001', title: 'Insufficient inventory guard', module: 'Order Management', status: 'Drift risk',
    source: 'src/orders/confirm.ts:42–47', type: 'Source-linked',
    description: 'Reject an order when available inventory is lower than the requested quantity.',
    snippet: 'if (inventory < order.quantity) {\n  return reject("INSUFFICIENT_STOCK");\n}\nreturn confirm(order);',
    test: 'expect(confirmOrder({ inventory: 2, quantity: 5 }))\n  .toEqual({ status: "REJECTED", reason: "INSUFFICIENT_STOCK" });',
  },
  {
    id: 'BR-002', title: 'High-value order approval', module: 'Order Management', status: 'Review needed',
    source: 'src/orders/approval.ts:18–31', type: 'AI-inferred · unverified',
    description: 'An inferred approval branch may apply to high-value orders. Review the threshold and business meaning.',
    snippet: 'if (order.total > approvalThreshold) {\n  return requestApproval(order);\n}',
    test: '// Generate only after the threshold and intended behavior are reviewed.',
  },
  {
    id: 'BR-003', title: 'Stock reservation window', module: 'Inventory Management', status: 'Source-linked',
    source: 'src/inventory/reserve.ts:64–79', type: 'Source-linked',
    description: 'Reserve available stock and preserve the existing expiration behavior during extraction.',
    snippet: 'return reserve({\n  orderId: order.id,\n  expiresAt: now + RESERVATION_WINDOW\n});',
    test: 'expect(reservation.expiresAt - now).toBe(RESERVATION_WINDOW);',
  },
  {
    id: 'BR-004', title: 'Duplicate payment protection', module: 'Payment Processing', status: 'Review needed',
    source: 'src/payments/charge.ts:103–118', type: 'Source-linked · review boundary',
    description: 'Preserve idempotency behavior when payment processing moves behind a service contract.',
    snippet: 'const existing = await payments.findByKey(idempotencyKey);\nif (existing) return existing;',
    test: 'expect(await chargeTwice(sameIdempotencyKey)).toHaveBeenCalledOnce();',
  },
];

const services = [
  { id: 'customer', title: 'Customer Service', icon: 'C', ownership: 'Customer records', contract: 'REST + customer events', dependencies: 'Order Service', phase: 'Phase 2', note: 'Extract after order contracts stabilize.' },
  { id: 'order', title: 'Order Service', icon: 'O', ownership: 'Orders + workflow', contract: 'REST + order events', dependencies: 'Customer, Inventory, Payment', phase: 'Phase 1', note: 'Highest coupling; preserve approval and inventory rules.' },
  { id: 'inventory', title: 'Inventory Service', icon: 'I', ownership: 'Stock + reservations', contract: 'REST + reservation events', dependencies: 'Order Service', phase: 'Phase 1', note: 'Define transaction and reservation ownership first.' },
  { id: 'payment', title: 'Payment Service', icon: 'P', ownership: 'Payment records', contract: 'REST + webhook events', dependencies: 'Order Service', phase: 'Phase 3', note: 'Preserve idempotency and external provider behavior.' },
];

const researchFindings = [
  {
    title: 'Next.js documentation', url: 'https://nextjs.org/docs', domain: 'nextjs.org',
    summary: 'Use the official framework documentation to review rendering, routing, and migration guidance relevant to the selected target version.',
    relevance: 'Application experience layer', limitation: 'Does not establish compatibility with this sample project.',
  },
  {
    title: 'Supabase Row Level Security', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security', domain: 'supabase.com',
    summary: 'Review database-enforced authorization policies when planning private project data and evidence storage.',
    relevance: 'Data and identity layer', limitation: 'Policies and grants still require implementation and verification.',
  },
  {
    title: 'GitHub Actions documentation', url: 'https://docs.github.com/actions', domain: 'docs.github.com',
    summary: 'Review repository workflow automation as a possible delivery mechanism for checks and validation evidence.',
    relevance: 'Delivery and observability', limitation: 'No CI workflow is connected in this prototype.',
  },
];

function StatusPill({ children, tone = 'neutral', icon = true }) {
  return <span className={`lb-status lb-status-${tone}`}>{icon && <i />}{children}</span>;
}

function SimTag({ children = 'SIMULATED' }) {
  return <span className="lb-sim-tag">{children}</span>;
}

function Panel({ eyebrow, title, description, action, className = '', children }) {
  return (
    <section className={`lb-panel ${className}`}>
      <div className="lb-panel-head">
        <div><span className="lb-section-kicker">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action && <div className="lb-panel-action">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = 'violet' }) {
  return (
    <article className={`lb-metric lb-metric-${tone}`}>
      <div className="lb-metric-top"><span>{label}</span><span className="lb-metric-icon"><Icon size={17} /></span></div>
      <div className="lb-metric-value"><strong>{value}</strong><SimTag>ILLUSTRATIVE</SimTag></div>
      <p>{note}</p>
    </article>
  );
}

function PrototypeBanner({ onOpen }) {
  return (
    <div className="lb-prototype-banner">
      <Info size={15} />
      <p><strong>Interactive UI prototype.</strong> Analysis, migration results, research, and test outcomes are illustrative.</p>
      <button onClick={onOpen}>View implementation status <ArrowUpRight size={12} /></button>
    </div>
  );
}

function Workflow({ onNavigate, planApproved }) {
  return (
    <section className="lb-workflow" aria-label="Modernization workflow">
      <div className="lb-workflow-title"><span>CONNECTED WORKFLOW</span><SimTag>PROTOTYPE STATES</SimTag></div>
      <div className="lb-workflow-steps">
        {workflow.map((step, index) => (
          <button key={step.number} onClick={() => onNavigate(step.id)} className={index === 2 ? 'current' : ''}>
            <span className="lb-workflow-number">{step.number}</span>
            <span className="lb-workflow-copy"><strong>{step.title}</strong><small>{index === 2 && planApproved ? 'Plan approved locally' : step.caption}</small></span>
            {index < workflow.length - 1 ? <ChevronRight size={14} /> : <ArrowUpRight size={13} />}
          </button>
        ))}
      </div>
    </section>
  );
}

const graphNodes = [
  { id: 'web', label: 'WEB UI', sub: 'Experience', x: 45, y: 45, w: 140 },
  { id: 'customer', label: 'CUSTOMER', sub: '5 dependencies', x: 45, y: 220, w: 140 },
  { id: 'inventory', label: 'INVENTORY', sub: '6 candidate rules', x: 310, y: 25, w: 140 },
  { id: 'orders', label: 'ORDERS', sub: '9 candidate rules', x: 310, y: 140, w: 140, active: true },
  { id: 'events', label: 'EVENTS', sub: 'Shared contracts', x: 310, y: 255, w: 140 },
  { id: 'payment', label: 'PAYMENT', sub: 'Idempotency risk', x: 575, y: 65, w: 140, warn: true },
  { id: 'db', label: 'POSTGRES', sub: 'Shared data', x: 575, y: 220, w: 140, database: true },
];
const graphEdges = [
  [185, 75, 310, 155], [185, 245, 310, 175], [380, 75, 380, 140],
  [450, 155, 575, 105, true], [450, 180, 575, 235], [450, 255, 575, 250],
  [380, 190, 380, 255], [185, 245, 575, 250],
];

function DependencyGraph() {
  return (
    <div className="lb-graph-wrap">
      <svg className="lb-dependency-graph" viewBox="0 0 760 335" role="img" aria-label="Illustrative dependency graph for an order management monolith">
        <defs>
          <marker id="lbGraphArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
          <linearGradient id="lbOrderNode" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#272037" /><stop offset="1" stopColor="#17141f" /></linearGradient>
        </defs>
        <g className="lb-graph-grid"><path d="M0 110H760M0 220H760M250 0V335M510 0V335" /></g>
        <g className="lb-graph-edges">{graphEdges.map(([x1, y1, x2, y2, warn], index) => <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className={warn ? 'warn' : ''} markerEnd="url(#lbGraphArrow)" />)}</g>
        {graphNodes.map((node) => <g key={node.id} className={`lb-graph-node ${node.active ? 'active' : ''} ${node.warn ? 'warn' : ''}`}>
          <rect x={node.x} y={node.y} width={node.w} height="52" rx="8" fill={node.active ? 'url(#lbOrderNode)' : undefined} />
          {node.database && <path d={`M${node.x + 13} ${node.y + 18}c0-5 18-5 18 0s-18 5-18 0Zm0 0v12c0 5 18 5 18 0V18`} />}
          <text x={node.x + (node.database ? 40 : 14)} y={node.y + 22} className="lb-graph-label">{node.label}</text>
          <text x={node.x + 14} y={node.y + 39} className="lb-graph-sub">{node.sub}</text>
        </g>)}
      </svg>
      <div className="lb-graph-legend"><span><i /> Module relationship</span><span><i className="warn" /> Behavioral review required</span><span><Database size={11} /> Shared data dependency</span></div>
    </div>
  );
}

const originalCode = ['if (inventory < order.quantity) {', '  return reject("INSUFFICIENT_STOCK");', '}', 'return confirm(order);'];
const proposedCode = ['// inventory guard omitted', 'return confirm(order);', '', '// build succeeds — behavior differs'];

function CodePane({ title, lines, tone = 'original' }) {
  return (
    <div className={`lb-code-pane ${tone}`}>
      <div className="lb-code-head"><span><i /><i /><i /></span><code>{title}</code><SimTag>{tone === 'original' ? 'ORIGINAL' : 'PROPOSED'}</SimTag></div>
      <pre>{lines.map((line, index) => <div key={`${line}-${index}`} className={tone === 'proposed' && index < 2 ? 'changed' : ''}><span>{index + 1}</span><code>{line || ' '}</code></div>)}</pre>
    </div>
  );
}

function DriftComparison({ state, onRun, compact = false }) {
  const running = state === 'running';
  return (
    <div className={`lb-drift-comparison ${compact ? 'compact' : ''}`}>
      <div className="lb-drift-code-grid"><CodePane title="legacy/orders/confirm.ts" lines={originalCode} /><CodePane title="proposed/order-service/confirm.ts" lines={proposedCode} tone="proposed" /></div>
      <div className="lb-drift-verdict">
        <div className="lb-drift-verdict-title"><AlertTriangle size={16} /><div><strong>Decision condition changed</strong><span>Illustrative mismatch · not an executed repository result</span></div><StatusPill tone="red">BLOCK APPROVAL</StatusPill></div>
        <div className="lb-evidence-grid">
          <div><span>TEST INPUT</span><code>inventory: 2{`\n`}quantity: 5</code></div>
          <div><span>EXPECTED</span><code>REJECTED{`\n`}INSUFFICIENT_STOCK</code></div>
          <div><span>OBSERVED</span><code className="danger">CONFIRMED{`\n`}illustrative result</code></div>
          <div><span>NEXT ACTION</span><p>Restore guard and rerun in an isolated worker.</p></div>
        </div>
      </div>
      {onRun && <div className="lb-drift-actions"><p><Info size={12} /> Passing tests would not prove complete behavioral equivalence.</p><button className="lb-button lb-button-secondary" onClick={onRun} disabled={running}>{running ? <Loader2 size={13} className="lb-spin" /> : <Play size={13} />}{running ? 'Running illustrative test…' : 'Run illustrative test'}</button></div>}
    </div>
  );
}

function OverviewView({ onNavigate, onRunDiscovery, discoveryState, validationState, onRunValidation, planApproved }) {
  return (
    <>
      <div className="lb-metrics">
        <MetricCard label="MODULES DISCOVERED" value="12" note="Sample source inventory" icon={Boxes} />
        <MetricCard label="DEPENDENCIES MAPPED" value="38" note="Module + data relationships" icon={Network} tone="blue" />
        <MetricCard label="CANDIDATE RULES" value="24" note="Source-linked and inferred" icon={Braces} tone="green" />
        <MetricCard label="DRIFT RISKS" value="3" note="Review before approval" icon={AlertTriangle} tone="red" />
      </div>
      <Workflow onNavigate={onNavigate} planApproved={planApproved} />
      <div className="lb-overview-grid">
        <Panel eyebrow="UNDERSTAND · DEPENDENCY INTELLIGENCE" title="A system map with evidence, not guesswork." description="Illustrative relationships across modules and shared data." className="lb-overview-graph" action={<button className="lb-text-button" onClick={() => onNavigate('discovery')}>Inspect graph <ArrowUpRight size={12} /></button>}>
          <DependencyGraph />
        </Panel>
        <Panel eyebrow="PLAN · HUMAN REVIEW" title="Migration decisions" description="No boundary is universally correct." className="lb-overview-review" action={<StatusPill tone="amber">REVIEW</StatusPill>}>
          <div className="lb-review-list">
            <div><span><Check size={12} /></span><p><strong>Candidate boundaries</strong><small>4 proposed services</small></p></div>
            <div><span><Check size={12} /></span><p><strong>Data ownership</strong><small>Ownership mapped per service</small></p></div>
            <div className="attention"><span><AlertTriangle size={12} /></span><p><strong>Transaction boundaries</strong><small>Developer decision required</small></p></div>
            <div className="attention"><span><AlertTriangle size={12} /></span><p><strong>Rollback strategy</strong><small>Review before migration</small></p></div>
          </div>
          <div className="lb-service-mini">{services.map((service) => <span key={service.id}>{service.icon}</span>)}</div>
          <button className="lb-button lb-button-secondary lb-full-button" onClick={() => onNavigate('migration')}>Review migration plan <ArrowRight size={13} /></button>
          <p className="lb-panel-footnote">A modular monolith may remain the safer intermediate architecture.</p>
        </Panel>
        <Panel eyebrow="VALIDATE · BUSINESS LOGIC DRIFT" title="The build passes. The behavior does not." description="Illustrative insufficient-inventory regression." className="lb-overview-drift" action={<button className="lb-text-button" onClick={() => onNavigate('validation')}>Open detector <ArrowUpRight size={12} /></button>}>
          <DriftComparison state={validationState} onRun={onRunValidation} compact />
        </Panel>
        <Panel eyebrow="TINYFISH · EXTERNAL RESEARCH" title="Ground decisions in documentation." description="Research stays separate from confidential source analysis." className="lb-overview-research" action={<SimTag>PREVIEW</SimTag>}>
          <div className="lb-research-highlight"><span className="lb-source-icon"><BookOpen size={17} /></span><div><strong>Next.js documentation</strong><small>nextjs.org · illustrative research result</small></div></div>
          <p className="lb-research-summary">Review official guidance for the selected framework version before approving a migration scaffold.</p>
          <div className="lb-research-caveat"><LockKeyhole size={12} /> Never send confidential source or secrets to the external research agent.</div>
          <button className="lb-button lb-button-secondary lb-full-button" onClick={() => onNavigate('research')}>Open research workspace <ArrowRight size={13} /></button>
        </Panel>
      </div>
    </>
  );
}

function DiscoveryView({ state, onRun, selectedModule, setSelectedModule }) {
  const selected = modules.find((module) => module.name === selectedModule) || modules[0];
  return (
    <>
      <div className="lb-discovery-grid">
        <Panel eyebrow="ILLUSTRATIVE SOURCE MAP" title="Dependency intelligence" description="Candidate relationships for the sample order monolith." action={<StatusPill tone={state === 'running' ? 'violet' : 'neutral'}>{state === 'running' ? 'SIMULATING' : 'SAMPLE READY'}</StatusPill>}><DependencyGraph /></Panel>
        <Panel eyebrow="DISCOVER · AUTHORIZED SOURCE" title="Source inventory" description="No repository is connected in this prototype.">
          <div className="lb-source-card"><FolderGit2 size={20} /><div><strong>sample/order-management</strong><code>Illustrative TypeScript monolith</code></div><SimTag>SAMPLE</SimTag></div>
          <dl className="lb-source-details"><div><dt>Source access</dt><dd>Not connected</dd></div><div><dt>Parser</dt><dd>Proposed · TypeScript</dd></div><div><dt>Analysis evidence</dt><dd>Simulated</dd></div><div><dt>Credentials</dt><dd>Server-side only · planned</dd></div></dl>
          <div className="lb-security-note"><LockKeyhole size={14} /><p>Real ingestion must use authorized repositories, controlled archive handling, and private project storage.</p></div>
          <button className="lb-button lb-button-primary lb-full-button" onClick={onRun} disabled={state === 'running'}>{state === 'running' ? <Loader2 size={14} className="lb-spin" /> : <Play size={14} />}{state === 'running' ? 'Simulating discovery…' : 'Run discovery preview'}</button>
        </Panel>
      </div>
      <Panel eyebrow="UNDERSTAND · MODULE INVENTORY" title="Modules and ownership" description="Select a module to inspect its illustrative analysis context." className="lb-module-panel">
        <div className="lb-table-scroll"><table className="lb-table"><thead><tr><th>Module</th><th>Type</th><th>Dependencies</th><th>Candidate rules</th><th>Review</th><th aria-label="Actions" /></tr></thead><tbody>{modules.map((module) => <tr key={module.name} className={selected.name === module.name ? 'selected' : ''}><td><strong>{module.name}</strong><code>{module.source}</code></td><td>{module.type}</td><td>{module.dependencies}</td><td>{module.rules}</td><td><StatusPill tone={module.risk === 'High' ? 'red' : module.risk === 'Medium' || module.risk === 'Review' ? 'amber' : 'green'}>{module.risk.toUpperCase()}</StatusPill></td><td><button className="lb-text-button" onClick={() => setSelectedModule(module.name)}>Inspect <ChevronRight size={12} /></button></td></tr>)}</tbody></table></div>
        <div className="lb-module-detail"><span className="lb-detail-icon"><Code2 size={18} /></span><div><span>SELECTED MODULE · ILLUSTRATIVE</span><h3>{selected.name}</h3><p>{selected.ownership} · {selected.dependencies} dependencies · {selected.rules} candidate rules</p></div><StatusPill tone="neutral">SOURCE EVIDENCE REQUIRED</StatusPill></div>
      </Panel>
    </>
  );
}

function RulesView({ selectedRuleId, setSelectedRuleId, filter, setFilter, testGenerated, onGenerateTest }) {
  const filtered = rules.filter((rule) => filter === 'All' || rule.status === filter);
  const selected = rules.find((rule) => rule.id === selectedRuleId) || rules[0];
  return (
    <div className="lb-rules-layout">
      <Panel eyebrow="CANDIDATE RULE REGISTRY" title="Recovered business logic" description="Every inference needs evidence or human review." className="lb-rules-list-panel">
        <div className="lb-filter-row">{['All', 'Drift risk', 'Review needed', 'Source-linked'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="lb-rule-list">{filtered.map((rule) => <button key={rule.id} className={selected.id === rule.id ? 'active' : ''} onClick={() => setSelectedRuleId(rule.id)}><span className="lb-rule-id">{rule.id}</span><span className="lb-rule-copy"><strong>{rule.title}</strong><small>{rule.module}</small></span><StatusPill tone={rule.status === 'Drift risk' ? 'red' : rule.status === 'Review needed' ? 'amber' : 'green'}>{rule.status.toUpperCase()}</StatusPill><ChevronRight size={13} /></button>)}{filtered.length === 0 && <div className="lb-empty-small">No illustrative rules match this filter.</div>}</div>
      </Panel>
      <Panel eyebrow={`${selected.id} · RULE EVIDENCE`} title={selected.title} description={selected.description} className="lb-rule-detail-panel" action={<SimTag>{selected.type.toUpperCase()}</SimTag>}>
        <div className="lb-rule-source"><FileCode2 size={15} /><code>{selected.source}</code><span>Sample path</span></div>
        <CodePane title={selected.source.split(':')[0]} lines={selected.snippet.split('\n')} />
        <div className="lb-rule-review"><AlertTriangle size={14} /><p>AI-inferred or unverified findings must remain clearly labeled until supported by source evidence or an executed test.</p></div>
        {testGenerated ? <div className="lb-generated-test"><div><span>GENERATED REGRESSION TEST</span><SimTag>PROPOSED · NOT EXECUTED</SimTag></div><pre><code>{selected.test}</code></pre></div> : <button className="lb-button lb-button-primary" onClick={onGenerateTest}><TestTube2 size={14} /> Generate targeted test preview</button>}
      </Panel>
    </div>
  );
}

function MigrationView({ planApproved, onApprove, selectedServiceId, setSelectedServiceId, scaffoldState, onGenerate }) {
  const selected = services.find((service) => service.id === selectedServiceId) || services[1];
  return (
    <>
      <div className="lb-migration-layout">
        <Panel eyebrow="PLAN · CANDIDATE BOUNDARIES" title="Proposed service architecture" description="Select a service to review its ownership and migration phase." className="lb-boundaries-panel" action={<SimTag>EDITABLE PROPOSAL</SimTag>}>
          <div className="lb-service-grid">{services.map((service) => <button key={service.id} className={selected.id === service.id ? 'active' : ''} onClick={() => setSelectedServiceId(service.id)}><span className="lb-service-badge">{service.icon}</span><span><strong>{service.title}</strong><small>{service.ownership}</small></span><StatusPill tone="neutral">{service.phase.toUpperCase()}</StatusPill></button>)}</div>
          <div className="lb-service-detail"><div><span>SELECTED BOUNDARY</span><h3>{selected.title}</h3><p>{selected.note}</p></div><dl><div><dt>Data ownership</dt><dd>{selected.ownership}</dd></div><div><dt>Contracts</dt><dd>{selected.contract}</dd></div><div><dt>Dependencies</dt><dd>{selected.dependencies}</dd></div><div><dt>Migration phase</dt><dd>{selected.phase}</dd></div></dl></div>
        </Panel>
        <Panel eyebrow="HUMAN APPROVAL CHECKPOINT" title="Review before generation" description="Approval is a local UI state; no code is changed." className="lb-approval-panel" action={<StatusPill tone={planApproved ? 'green' : 'amber'}>{planApproved ? 'APPROVED LOCALLY' : 'AWAITING REVIEW'}</StatusPill>}>
          <div className="lb-approval-checklist">{['Business boundaries reviewed', 'Data ownership is explicit', 'API and event contracts reviewed', 'Incremental phases and rollback considered'].map((item, index) => <div key={item}><span className={index < 2 ? 'checked' : ''}>{index < 2 ? <Check size={11} /> : <CircleDot size={11} />}</span><p>{item}</p></div>)}</div>
          <div className="lb-architecture-note"><Layers3 size={16} /><p><strong>Architecture checkpoint</strong>A modular monolith may be the better intermediate step when an immediate split adds unnecessary complexity.</p></div>
          <button className="lb-button lb-button-secondary lb-full-button" onClick={onApprove} disabled={planApproved}><CheckCircle2 size={14} />{planApproved ? 'Plan approved locally' : 'Approve illustrative plan'}</button>
          <button className="lb-button lb-button-primary lb-full-button" onClick={onGenerate} disabled={scaffoldState === 'running'}>{scaffoldState === 'running' ? <Loader2 size={14} className="lb-spin" /> : <Sparkles size={14} />}{scaffoldState === 'running' ? 'Generating preview…' : 'Generate scaffold preview'}</button>
        </Panel>
      </div>
      <Panel eyebrow="MIGRATE · REVIEWABLE STARTER ARTIFACTS" title="Proposed scaffold" description="Illustrative file structure only; no service generator is implemented here." className="lb-scaffold-panel" action={<SimTag>{scaffoldState === 'complete' ? 'PREVIEW READY' : 'NOT GENERATED'}</SimTag>}>
        {scaffoldState === 'complete' ? <div className="lb-scaffold-result"><div className="lb-file-tree">{['order-service/', '├─ src/orders/confirm.ts', '├─ src/orders/contract.ts', '├─ tests/confirm.regression.test.ts', '└─ migration/rollback-notes.md'].map((file) => <code key={file}>{file}</code>)}</div><div className="lb-scaffold-message"><FileCheck2 size={24} /><h3>Reviewable scaffold preview</h3><p>Generated boundaries are recommendations. Supported code generation, tests, and migration execution still require implementation and human review.</p><StatusPill tone="amber">NO FILES WRITTEN</StatusPill></div></div> : <div className="lb-empty-state"><span><Server size={24} /></span><h3>{planApproved ? 'Ready for a simulated scaffold preview' : 'Approve the illustrative plan to continue'}</h3><p>The prototype enforces the review checkpoint before showing proposed starter artifacts.</p><button className="lb-button lb-button-secondary" onClick={onGenerate}>{planApproved ? 'Generate preview' : 'Check approval requirement'} <ArrowRight size={13} /></button></div>}
      </Panel>
    </>
  );
}

function ValidationView({ state, onRun, onDownload }) {
  return (
    <>
      <Panel eyebrow="FLAGSHIP DIFFERENTIATOR · ILLUSTRATIVE EXAMPLE" title="Catch business-logic changes before approval." description="Original and proposed rules are compared through targeted regression evidence." className="lb-validation-panel" action={<button className="lb-button lb-button-secondary" onClick={onDownload}><Download size={13} /> Export sample evidence</button>}>
        <DriftComparison state={state} onRun={onRun} />
      </Panel>
      <Panel eyebrow="REGRESSION EVIDENCE · SIMULATED STATES" title="Targeted validation suite" description="A passing suite never proves complete behavioral equivalence." className="lb-test-suite-panel">
        <div className="lb-table-scroll"><table className="lb-table"><thead><tr><th>Test</th><th>Business rule</th><th>Evidence</th><th>Status</th><th>Execution</th></tr></thead><tbody>
          <tr><td><strong>Rejects insufficient inventory</strong><code>confirm.regression.test.ts</code></td><td>BR-001</td><td>Expected rejection; illustrative confirmation</td><td><StatusPill tone="red">MISMATCH</StatusPill></td><td>Simulated</td></tr>
          <tr><td><strong>Preserves reservation window</strong><code>reserve.regression.test.ts</code></td><td>BR-003</td><td>Proposed expected-value comparison</td><td><StatusPill tone="green">PASS · SAMPLE</StatusPill></td><td>Simulated</td></tr>
          <tr><td><strong>Requires high-value approval</strong><code>approval.regression.test.ts</code></td><td>BR-002</td><td>Threshold needs human review</td><td><StatusPill tone="amber">UNVERIFIED</StatusPill></td><td>Not executed</td></tr>
          <tr><td><strong>Prevents duplicate payment</strong><code>charge.regression.test.ts</code></td><td>BR-004</td><td>Isolated worker required</td><td><StatusPill tone="neutral">PLANNED</StatusPill></td><td>Not implemented</td></tr>
        </tbody></table></div>
        <div className="lb-validation-footer"><ShieldCheck size={15} /><p>Confirmed failures require real execution in an isolated worker. This dashboard only demonstrates the intended evidence experience.</p></div>
      </Panel>
    </>
  );
}

function ResearchView({ state, onRun, query, setQuery }) {
  return (
    <>
      <Panel eyebrow="TINYFISH MIGRATION RESEARCH AGENT" title="Research external documentation with citations." description="Illustrative preview only; no live TinyFish integration is configured." className="lb-research-workspace" action={<SimTag>NO LIVE QUERY</SimTag>}>
        <form className="lb-research-form" onSubmit={(event) => { event.preventDefault(); onRun(); }}><label><span>Research request</span><div><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Research request" /></div></label><button className="lb-button lb-button-primary" type="submit" disabled={state === 'running' || !query.trim()}>{state === 'running' ? <Loader2 size={14} className="lb-spin" /> : <Sparkles size={14} />}{state === 'running' ? 'Previewing research…' : 'Preview cited research'}</button></form>
        <div className="lb-research-flow">{['LegacyBridge analysis', 'TinyFish research', 'Official documentation', 'Cited recommendation', 'Developer review'].map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 4 && <ChevronRight size={13} />}</div>)}</div>
      </Panel>
      <div className="lb-research-results">{researchFindings.map((finding, index) => <article className="lb-panel lb-finding" key={finding.url}><div className="lb-finding-top"><span className="lb-source-icon"><BookOpen size={17} /></span><div><span>SOURCE {String(index + 1).padStart(2, '0')} · ILLUSTRATIVE</span><h2>{finding.title}</h2></div><a href={finding.url} target="_blank" rel="noreferrer" aria-label={`Open ${finding.title}`}><ExternalLink size={15} /></a></div><p>{finding.summary}</p><code>{finding.url}</code><dl><div><dt>Relevance</dt><dd>{finding.relevance}</dd></div><div><dt>Limitations</dt><dd>{finding.limitation}</dd></div><div><dt>Research time</dt><dd>[Populated at runtime]</dd></div></dl></article>)}</div>
      <div className="lb-responsibility-grid">
        <Panel eyebrow="EXTERNAL RESEARCH" title="TinyFish responsibilities"><div className="lb-responsibility-copy"><Globe2 size={21} /><p>Proposed use: search and evaluate external sources, then synthesize source-linked findings for migration context.</p><a href="https://docs.tinyfish.ai/research-api" target="_blank" rel="noreferrer">Official Research API documentation <ExternalLink size={12} /></a></div></Panel>
        <Panel eyebrow="SOURCE & VALIDATION" title="LegacyBridge responsibilities"><div className="lb-responsibility-copy"><Code2 size={21} /><p>Proposed use: inspect authorized source code, plan architecture changes, and run supported tests in controlled environments.</p><span>Not implemented in this repository</span></div></Panel>
      </div>
      <div className="lb-research-security"><LockKeyhole size={16} /><p><strong>Research security boundary</strong>Keep credentials server-side. Never send confidential source code or secrets to the external research agent. Verify every cited source for relevance.</p></div>
    </>
  );
}

function ReportsView({ onDownload }) {
  const reports = [
    { id: 'modernization', title: 'Modernization evidence report', description: 'Sample modules, dependencies, rules, review decisions, and validation status.', icon: FileJson2 },
    { id: 'migration', title: 'Migration plan report', description: 'Illustrative boundaries, ownership, contracts, phases, and approval state.', icon: Route },
    { id: 'validation', title: 'Business logic drift report', description: 'Illustrative rule comparison, test input, expected outcome, and review decision.', icon: ShieldCheck },
  ];
  return (
    <div className="lb-reports-layout">
      <Panel eyebrow="EVIDENCE EXPORT" title="Sample reports" description="Downloads contain illustrative JSON, not repository analysis." className="lb-reports-list">
        <div className="lb-report-list">{reports.map(({ id, title, description, icon: Icon }) => <article key={id}><span className="lb-report-icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{description}</p><span>ILLUSTRATIVE · GENERATED LOCALLY</span></div><button className="lb-button lb-button-secondary" onClick={() => onDownload(id)}><Download size={13} /> Download JSON</button></article>)}</div>
      </Panel>
      <Panel eyebrow="REPORT PREVIEW" title="Traceable decision record" description="A clear distinction between evidence and prototype state." className="lb-report-preview">
        <div className="lb-report-paper"><div className="lb-report-paper-head"><BridgeMark size={20} /><div><strong>LegacyBridge</strong><span>VALIDATION EVIDENCE · SAMPLE</span></div><SimTag>NOT EXECUTED</SimTag></div><h3>Insufficient inventory guard</h3><code>BR-001 · src/orders/confirm.ts:42–47</code><div className="lb-report-paper-grid"><div><span>EXPECTED</span><strong>Reject order</strong></div><div><span>OBSERVED</span><strong className="danger">Confirm order</strong></div><div><span>DECISION</span><strong>Block approval</strong></div><div><span>EXECUTION</span><strong>Simulated</strong></div></div><div className="lb-report-paper-note"><Info size={13} /> Illustrative UI evidence. No source repository or test worker was accessed.</div></div>
      </Panel>
    </div>
  );
}

function ImplementationModal({ onClose, previewMode }) {
  return (
    <div className="lb-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="lb-modal lb-status-modal" role="dialog" aria-modal="true" aria-labelledby="implementation-title">
        <div className="lb-modal-head"><div><span>REPOSITORY-AWARE STATUS</span><h2 id="implementation-title">What is real in this prototype?</h2></div><button onClick={onClose} aria-label="Close implementation status"><X size={18} /></button></div>
        <div className="lb-status-columns">
          <section className="working"><div><CheckCircle2 size={16} /><h3>Working UI</h3></div><ul><li>React + Vite responsive interface</li><li>Local navigation and interaction state</li><li>{previewMode ? 'No-key preview mode' : 'Clerk-protected session'}</li><li>Client-side illustrative JSON downloads</li></ul></section>
          <section className="simulated"><div><Sparkles size={16} /><h3>Simulated states</h3></div><ul><li>Source and dependency analysis</li><li>Business rules and migration plans</li><li>Drift results and regression outcomes</li><li>TinyFish research responses</li></ul></section>
          <section className="planned"><div><Clock3 size={16} /><h3>Planned / unverified</h3></div><ul><li>Repository ingestion and language parsers</li><li>Service scaffold generation</li><li>Isolated untrusted-code execution</li><li>Live TinyFish, Supabase, or Stripe integrations</li></ul></section>
        </div>
        <div className="lb-modal-note"><AlertTriangle size={14} /><p>No interface result should be interpreted as proof of migration success, behavioral equivalence, security control implementation, or external service connectivity.</p></div>
        <div className="lb-modal-actions"><button className="lb-button lb-button-primary" onClick={onClose}>Understood</button></div>
      </div>
    </div>
  );
}

function CommandPalette({ query, setQuery, onClose, onNavigate, onRule }) {
  const navItems = navigation.flatMap((group) => group.items);
  const matchingViews = navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  const matchingRules = rules.filter((rule) => `${rule.id} ${rule.title} ${rule.module}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  return (
    <div className="lb-modal-backdrop lb-command-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="lb-command" role="dialog" aria-modal="true" aria-label="Search modernization workspace">
        <div className="lb-command-input"><Search size={17} /><input autoFocus placeholder="Search views and business rules…" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>ESC</kbd></div>
        <div className="lb-command-results"><span>WORKSPACE</span>{matchingViews.map((item) => <button key={item.id} onClick={() => onNavigate(item.id)}><item.icon size={15} /><div><strong>{item.label}</strong><small>{viewMeta[item.id].description}</small></div><ArrowUpRight size={12} /></button>)}{matchingRules.length > 0 && <span>BUSINESS RULES</span>}{matchingRules.map((rule) => <button key={rule.id} onClick={() => onRule(rule.id)}><Braces size={15} /><div><strong>{rule.title}</strong><small>{rule.id} · {rule.module}</small></div><ArrowUpRight size={12} /></button>)}{matchingViews.length === 0 && matchingRules.length === 0 && <div className="lb-command-empty"><Search size={22} /><p>No workspace results found.</p></div>}</div>
        <div className="lb-command-foot"><span><kbd>⌘ K</kbd> Search workspace</span><SimTag>SAMPLE DATA</SimTag></div>
      </div>
    </div>
  );
}

export default function OperationsCommandCenter({ previewMode = false }) {
  const [view, setView] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [discoveryState, setDiscoveryState] = useState('complete');
  const [validationState, setValidationState] = useState('complete');
  const [researchState, setResearchState] = useState('complete');
  const [scaffoldState, setScaffoldState] = useState('idle');
  const [planApproved, setPlanApproved] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState('BR-001');
  const [ruleFilter, setRuleFilter] = useState('All');
  const [testGenerated, setTestGenerated] = useState(false);
  const [selectedModule, setSelectedModule] = useState('Order Management');
  const [selectedServiceId, setSelectedServiceId] = useState('order');
  const [researchQuery, setResearchQuery] = useState('Find official migration guidance for the selected Next.js target version.');
  const [statusOpen, setStatusOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const timers = useRef([]);

  const schedule = (callback, delay) => { const timer = window.setTimeout(callback, delay); timers.current.push(timer); };
  const notify = (message) => setToast(message);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 3800); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); }
      if (event.key === 'Escape') { setCommandOpen(false); setStatusOpen(false); setMobileNav(false); setNotificationsOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const changeView = (next) => {
    setView(next); setMobileNav(false); setNotificationsOpen(false); setCommandOpen(false); setCommandQuery('');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const runDiscovery = () => {
    if (discoveryState === 'running') return;
    setDiscoveryState('running'); notify('Discovery preview started — no repository is being inspected.');
    schedule(() => { setDiscoveryState('complete'); notify('Illustrative discovery state restored. No source analysis was executed.'); }, 1500);
  };
  const runValidation = () => {
    if (validationState === 'running') return;
    setValidationState('running'); notify('Running an illustrative validation sequence.');
    schedule(() => { setValidationState('complete'); notify('Simulated mismatch restored. No test worker was executed.'); }, 1700);
  };
  const runResearch = () => {
    if (researchState === 'running') return;
    setResearchState('running'); notify('Preparing illustrative research — no external request is sent.');
    schedule(() => { setResearchState('complete'); notify('Source-linked sample findings are ready. This was not a live query.'); }, 1400);
  };
  const generateTest = () => {
    setTestGenerated(true); notify('Targeted test preview generated locally. It has not been executed.');
  };
  const approvePlan = () => {
    setPlanApproved(true); setScaffoldState('idle'); notify('Illustrative migration plan approved locally. No code was changed.');
  };
  const generateScaffold = () => {
    if (!planApproved) { notify('Review checkpoint: approve the illustrative plan before generating a preview.'); return; }
    if (scaffoldState === 'running') return;
    setScaffoldState('running'); notify('Generating a simulated scaffold preview. No files will be written.');
    schedule(() => { setScaffoldState('complete'); notify('Scaffold preview ready. No service code was generated or executed.'); }, 1600);
  };
  const downloadReport = (kind = 'modernization') => {
    const payload = {
      product: 'LegacyBridge', report: kind, status: 'ILLUSTRATIVE — NOT REPOSITORY ANALYSIS',
      generatedBy: 'Local UI prototype', sourceAccessed: false, externalIntegrationsUsed: false, testWorkerExecuted: false,
      project: 'sample/order-management', workflow: ['DISCOVER', 'UNDERSTAND', 'PLAN', 'MIGRATE', 'VALIDATE'],
      migrationPlanApprovedLocally: planApproved,
      driftExample: { rule: 'BR-001', input: { inventory: 2, quantity: 5 }, expected: 'REJECTED — INSUFFICIENT_STOCK', observed: 'CONFIRMED — illustrative result', decision: 'BLOCK APPROVAL', execution: 'SIMULATED' },
      note: 'Passing tests would not prove complete behavioral equivalence. No migration success is claimed.',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `legacybridge-${kind}-illustrative.json`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    notify('Illustrative JSON downloaded. It contains no real analysis or test results.');
  };

  const primaryAction = {
    overview: { label: 'Run discovery', action: runDiscovery, busy: discoveryState === 'running' },
    discovery: { label: 'Run discovery', action: runDiscovery, busy: discoveryState === 'running' },
    rules: { label: testGenerated ? 'Test preview ready' : 'Generate test preview', action: generateTest, busy: false },
    migration: { label: 'Generate preview', action: generateScaffold, busy: scaffoldState === 'running' },
    validation: { label: 'Run illustrative test', action: runValidation, busy: validationState === 'running' },
    research: { label: 'Preview research', action: runResearch, busy: researchState === 'running' },
    reports: { label: 'Download sample', action: () => downloadReport('modernization'), busy: false },
  }[view];

  return (
    <div className="lb-shell">
      {mobileNav && <button className="lb-nav-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}
      <aside className={`lb-sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="lb-brand-row"><Link to="/" className="lb-brand" aria-label="LegacyBridge home"><span className="lb-brand-mark"><BridgeMark size={24} /></span><span><strong>LegacyBridge</strong><small>Code intelligence</small></span></Link><button className="lb-sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <button className="lb-workspace-switch" onClick={() => notify('The order management workspace is an illustrative sample. Repository import is not implemented.')}><span className="lb-project-icon"><FolderGit2 size={16} /></span><span><strong>Order management</strong><small>Illustrative project</small></span><ChevronRight size={13} /></button>
        <nav className="lb-nav" aria-label="Dashboard navigation">{navigation.map((group) => <div className="lb-nav-group" key={group.label}><span className="lb-nav-label">{group.label}</span>{group.items.map((item) => <button key={item.id} className={`lb-nav-item ${view === item.id ? 'active' : ''}`} onClick={() => changeView(item.id)} aria-current={view === item.id ? 'page' : undefined}><item.icon size={17} /><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}</div>)}</nav>
        <div className="lb-sidebar-bottom">
          <button className="lb-implementation-card" onClick={() => setStatusOpen(true)}><span><i /> UI prototype</span><strong>Implementation status</strong><small>Separate real, simulated, and planned.</small><ArrowUpRight size={13} /></button>
          <div className="lb-sidebar-foot"><span><ShieldCheck size={13} /> Human review required</span><small>v0.1 · hackathon prototype</small></div>
        </div>
      </aside>

      <main className="lb-main">
        <header className="lb-topbar">
          <div className="lb-topbar-left"><button className="lb-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="lb-breadcrumb"><span>Projects</span><ChevronRight size={12} /><strong>Order management</strong></div></div>
          <div className="lb-topbar-actions"><button className="lb-search-trigger" onClick={() => setCommandOpen(true)} aria-label="Search workspace"><Search size={15} /><span>Search workspace…</span><kbd>⌘ K</kbd></button><StatusPill tone="violet">ILLUSTRATIVE WORKSPACE</StatusPill><div className="lb-notification-wrap"><button className="lb-icon-button" onClick={() => setNotificationsOpen((value) => !value)} aria-label="View prototype notifications" aria-expanded={notificationsOpen}><Bell size={17} /><i /></button>{notificationsOpen && <div className="lb-notifications"><div><strong>Prototype notifications</strong><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={14} /></button></div><article><AlertTriangle size={14} /><p><strong>Illustrative drift risk</strong><span>BR-001 requires review · simulated</span></p></article><article><Sparkles size={14} /><p><strong>Research preview</strong><span>3 official source examples · not live</span></p></article><article><Info size={14} /><p><strong>No integrations connected</strong><span>External execution is unavailable</span></p></article></div>}</div>{previewMode ? <span className="lb-preview-avatar">UI</span> : <UserButton appearance={{ elements: { userButtonAvatarBox: 'lb-clerk-avatar' } }} afterSignOutUrl="/" />}</div>
        </header>

        <div className="lb-content">
          <div className="lb-page-header"><div className="lb-page-heading"><span className="lb-eyebrow"><i /> LEGACY CODE INTELLIGENCE · LB-2048</span><h1>{viewMeta[view].title}</h1><p>{viewMeta[view].description}</p></div><div className="lb-page-actions"><button className="lb-button lb-button-secondary" onClick={() => downloadReport(view === 'validation' ? 'validation' : 'modernization')}><Download size={14} /> Export sample</button><button className="lb-button lb-button-primary" onClick={primaryAction.action} disabled={primaryAction.busy || (view === 'rules' && testGenerated)}>{primaryAction.busy ? <Loader2 size={14} className="lb-spin" /> : view === 'reports' ? <Download size={14} /> : <Play size={14} />}{primaryAction.busy ? 'Simulating…' : primaryAction.label}</button></div></div>
          <PrototypeBanner onOpen={() => setStatusOpen(true)} />

          {view === 'overview' && <OverviewView onNavigate={changeView} onRunDiscovery={runDiscovery} discoveryState={discoveryState} validationState={validationState} onRunValidation={runValidation} planApproved={planApproved} />}
          {view === 'discovery' && <DiscoveryView state={discoveryState} onRun={runDiscovery} selectedModule={selectedModule} setSelectedModule={setSelectedModule} />}
          {view === 'rules' && <RulesView selectedRuleId={selectedRuleId} setSelectedRuleId={(id) => { setSelectedRuleId(id); setTestGenerated(false); }} filter={ruleFilter} setFilter={setRuleFilter} testGenerated={testGenerated} onGenerateTest={generateTest} />}
          {view === 'migration' && <MigrationView planApproved={planApproved} onApprove={approvePlan} selectedServiceId={selectedServiceId} setSelectedServiceId={setSelectedServiceId} scaffoldState={scaffoldState} onGenerate={generateScaffold} />}
          {view === 'validation' && <ValidationView state={validationState} onRun={runValidation} onDownload={() => downloadReport('validation')} />}
          {view === 'research' && <ResearchView state={researchState} onRun={runResearch} query={researchQuery} setQuery={setResearchQuery} />}
          {view === 'reports' && <ReportsView onDownload={downloadReport} />}
        </div>
      </main>

      {statusOpen && <ImplementationModal onClose={() => setStatusOpen(false)} previewMode={previewMode} />}
      {commandOpen && <CommandPalette query={commandQuery} setQuery={setCommandQuery} onClose={() => { setCommandOpen(false); setCommandQuery(''); }} onNavigate={changeView} onRule={(id) => { setSelectedRuleId(id); setTestGenerated(false); changeView('rules'); }} />}
      <div className={`lb-toast ${toast ? 'show' : ''}`} role="status"><CheckCircle2 size={15} /><span>{toast}</span></div>
    </div>
  );
}
