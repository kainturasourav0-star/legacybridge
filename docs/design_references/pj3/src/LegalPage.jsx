import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, FileText, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import BridgeMark from './BridgeMark';

const LAST_UPDATED = 'October 25, 2026';

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'PRIVACY AT LEGACYBRIDGE',
    description: 'A plain-language explanation of what this prototype does—and does not do—with information.',
    readTime: '5 minute read',
    icon: ShieldCheck,
    asideTitle: 'Preview-first privacy',
    asideText: 'Research and subscription interactions on this website are local previews. They do not send your entries to LegacyBridge or an external AI service.',
    sections: [
      {
        id: 'scope',
        title: 'Scope and prototype status',
        paragraphs: [
          'This policy applies to the LegacyBridge hackathon prototype, including its landing page, authentication preview, and illustrative modernization dashboard. It describes the current demonstration rather than a generally available commercial service.',
          'LegacyBridge is designed around evidence-based legacy modernization. Proposed capabilities are labeled throughout the interface so they are not confused with implemented functionality.',
        ],
        note: 'Use sample information when evaluating the prototype. Do not enter real passwords, confidential source code, secrets, or sensitive business data into a demonstration.',
      },
      {
        id: 'information',
        title: 'Information you may provide',
        paragraphs: ['The information involved depends on which part of the experience you use.'],
        bullets: [
          'Preview authentication fields: in UI-preview mode, entries are not checked, transmitted, or stored by LegacyBridge. Submitting the form simply opens the illustrative dashboard.',
          'Research and subscription previews: these interactions update only the visible page state. The current prototype does not transmit the research question or subscribe the email address.',
          'Authentication when Clerk is enabled: if a deployment connects Clerk, the authentication information you submit is processed to provide sign-in and account functionality.',
          'Technical information: the project code includes no analytics or advertising trackers. A hosting provider may still process standard request logs, such as IP address, browser information, and request time.',
        ],
      },
      {
        id: 'use',
        title: 'How information may be used',
        paragraphs: ['Where a deployment does process information, it may be used to operate and secure the experience, provide authentication, maintain the service, respond to project-related requests, and improve the prototype.'],
        bullets: [
          'We do not use preview form entries to build advertising profiles.',
          'We do not sell information submitted to this prototype.',
          'Illustrative dashboard findings are not represented as analysis of your actual repository or business.',
        ],
      },
      {
        id: 'previews',
        title: 'Local previews and external research',
        paragraphs: [
          'The TinyFish research panel on this website is an illustrative interaction. Clicking its preview control does not initiate a TinyFish request. The footer subscription form likewise sends nothing and explicitly reports that behavior after submission.',
          'External documentation links open third-party websites only when you choose them. A proposed integration label does not mean that provider receives data from the current prototype.',
        ],
        note: 'TinyFish is described as an external documentation research agent—not as a recipient of confidential source code in this design. No live source-analysis or automatic migration execution is performed by this landing-page preview.',
      },
      {
        id: 'providers',
        title: 'Authentication and service providers',
        paragraphs: [
          'A deployment may rely on infrastructure providers to host the website and, when configured, Clerk to provide authentication and session management. Those providers process information under their own terms and privacy documentation.',
          'The current interface does not establish live TinyFish, Supabase, or Stripe data flows. Any future operational integration should be disclosed with its purpose and corresponding provider terms.',
        ],
      },
      {
        id: 'retention',
        title: 'Retention and security',
        paragraphs: [
          'Local review states, filters, approvals, and preview notices are temporary interface states—not durable project records. Refreshing or leaving the relevant experience may reset them.',
          'Proposed safeguards such as row-level security, server-side credentials, controlled archive handling, and isolated workers are architectural requirements, not claims that every control is already implemented. No website can guarantee absolute security.',
        ],
        bullets: [
          'Do not place credentials or secrets in client-side code or public demonstration fields.',
          'Retention for hosting logs or enabled authentication is determined by the relevant provider and deployment configuration.',
          'A production release should define and publish its actual retention schedule before collecting operational data.',
        ],
      },
      {
        id: 'choices',
        title: 'Your choices, changes, and contact',
        paragraphs: [
          'You can use sample data, avoid optional forms, clear site data through your browser, or stop using the prototype. If live authentication is enabled, use the available account controls or contact the project maintainer regarding account information.',
          'This policy may change as the prototype evolves. The “Last updated” date will be revised when material changes are made. Questions can be raised with the LegacyBridge project maintainer through the official channel used to share this deployment.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    eyebrow: 'TERMS FOR THE PROTOTYPE',
    description: 'The ground rules for evaluating LegacyBridge responsibly, with clear limits around illustrative output and human review.',
    readTime: '6 minute read',
    icon: Scale,
    asideTitle: 'Human review is required',
    asideText: 'Generated rules, service boundaries, scaffolds, and tests are illustrative until reviewed and verified. Never treat a preview as proof of behavioral equivalence.',
    sections: [
      {
        id: 'acceptance',
        title: 'Acceptance and prototype status',
        paragraphs: [
          'These terms govern your use of the LegacyBridge hackathon prototype. By accessing or using the demonstration, you agree to these terms. If you do not agree, do not use the prototype.',
          'LegacyBridge is an evolving demonstration of a legacy-code modernization workflow. It is not presented as a generally available production service, and no service-level commitment is provided.',
        ],
      },
      {
        id: 'permitted-use',
        title: 'Permitted and responsible use',
        paragraphs: ['You may evaluate and demonstrate the interface using information you are authorized to use, preferably non-confidential sample data. You agree not to misuse the experience.'],
        bullets: [
          'Do not violate applicable law, infringe another person’s rights, or attempt to disrupt the service.',
          'Do not probe or bypass security controls without authorization.',
          'Do not submit source code, credentials, personal information, or other material you lack permission to use.',
          'Do not misrepresent illustrative results as verified analysis, executed tests, completed migrations, or customer outcomes.',
        ],
      },
      {
        id: 'illustrative-output',
        title: 'Illustrative output and human review',
        paragraphs: [
          'Rules, dependency relationships, service boundaries, migration plans, generated scaffolds, drift findings, and validation evidence shown in the prototype may be simulated or illustrative. They are provided for evaluation of the product concept.',
          'A proposed service boundary is not universally correct. A generated regression test is not evidence that it passed, and passing a targeted test would not by itself prove complete behavioral equivalence. Qualified developers must review and verify consequential decisions in an appropriate environment.',
        ],
        note: 'No source code or migration is changed by the local approval controls on this website. Untrusted code execution belongs in an isolated worker, not an ordinary web request.',
      },
      {
        id: 'external-services',
        title: 'External services and documentation',
        paragraphs: [
          'Third-party names and links are provided to explain the proposed architecture or help you consult official documentation. They do not imply endorsement, partnership, availability, or an active integration.',
          'Your use of a third-party website or service is subject to that provider’s terms. TinyFish is described only as an external documentation research capability; any future implementation must keep credentials server-side and must not receive confidential source or secrets through this research path.',
        ],
      },
      {
        id: 'content',
        title: 'Your content and project materials',
        paragraphs: [
          'You retain whatever rights you hold in your own code and content. These terms do not transfer those rights or grant rights to third-party software, trademarks, or documentation.',
          'The current landing-page preview does not provide an operational repository upload or migration service. If a future deployment accepts project content, you must have the rights and authorization needed to submit it, and you should review the applicable data-handling terms first.',
        ],
      },
      {
        id: 'availability',
        title: 'Availability, changes, and disclaimers',
        paragraphs: [
          'The prototype may be changed, suspended, or withdrawn at any time. Features may remain incomplete, and preview states may be reset without notice.',
          'To the extent permitted by law, the prototype is provided “as is” and “as available,” without warranties of accuracy, reliability, fitness for a particular purpose, non-infringement, or uninterrupted availability. You are responsible for evaluating whether and how to use any output.',
        ],
      },
      {
        id: 'liability',
        title: 'Liability, changes, and contact',
        paragraphs: [
          'To the extent permitted by law, the project contributors are not liable for indirect, incidental, special, consequential, or punitive damages arising from reliance on illustrative output or use of the prototype. Nothing in these terms excludes liability or consumer protections that cannot legally be excluded.',
          'These terms may be updated as the project evolves, with the revision date shown above. Questions can be raised with the LegacyBridge project maintainer through the official channel used to share this deployment.',
        ],
      },
    ],
  },
};

export default function LegalPage({ type = 'privacy' }) {
  const content = legalContent[type] || legalContent.privacy;
  const Icon = content.icon;
  const isPrivacy = type === 'privacy';
  const otherPath = isPrivacy ? '/terms' : '/privacy';
  const otherTitle = isPrivacy ? 'Terms & Conditions' : 'Privacy Policy';

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${content.title} — LegacyBridge`;
    return () => { document.title = previousTitle; };
  }, [content.title]);

  return (
    <div className="ax-site ax-legal-site" id="legal-top">
      <header className="ax-legal-nav">
        <Link className="ax-logo" to="/" aria-label="LegacyBridge home"><span><BridgeMark size={22} /></span><strong>LegacyBridge</strong></Link>
        <nav className="ax-legal-nav-pill" aria-label="Legal pages">
          <Link className={isPrivacy ? 'active' : ''} to="/privacy">Privacy</Link>
          <Link className={!isPrivacy ? 'active' : ''} to="/terms">Terms</Link>
        </nav>
        <Link className="ax-legal-back" to="/"><ArrowLeft size={13} /><span>Back to website</span></Link>
      </header>

      <main>
        <section className="ax-legal-hero" aria-labelledby="legal-title">
          <div className="ax-legal-grid" aria-hidden="true" />
          <div className="ax-legal-beam" aria-hidden="true" />
          <div className="ax-legal-hero-copy">
            <span className="ax-legal-eyebrow"><Icon size={14} />{content.eyebrow}</span>
            <h1 id="legal-title">{content.title}</h1>
            <p>{content.description}</p>
            <div className="ax-legal-meta"><span>Last updated {LAST_UPDATED}</span><i /><span>{content.readTime}</span><i /><span>Current prototype</span></div>
          </div>
        </section>

        <div className="ax-legal-layout">
          <aside className="ax-legal-sidebar">
            <nav className="ax-legal-toc" aria-label="On this page">
              <span>ON THIS PAGE</span>
              <ol>{content.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><small>{String(index + 1).padStart(2, '0')}</small>{section.title}</a></li>)}</ol>
            </nav>
            <div className="ax-legal-aside-card"><Icon size={18} /><strong>{content.asideTitle}</strong><p>{content.asideText}</p></div>
          </aside>

          <article className="ax-legal-content">
            {content.sections.map((section, index) => (
              <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
                <div className="ax-legal-section-number">{String(index + 1).padStart(2, '0')}</div>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}><CheckCircle2 size={15} /><span>{bullet}</span></li>)}</ul>}
                {section.note && <div className="ax-legal-note"><ShieldCheck size={17} /><p>{section.note}</p></div>}
              </section>
            ))}

            <Link className="ax-legal-next" to={otherPath}>
              <span><small>CONTINUE READING</small><strong>{otherTitle}</strong></span><span className="ax-legal-next-icon"><ArrowRight size={19} /></span>
            </Link>
            <div className="ax-legal-prototype-note"><FileText size={14} /><p>Written for the current LegacyBridge demonstration. Operational details and legal copy should be reviewed before a commercial launch.</p></div>
          </article>
        </div>
      </main>

      <footer className="ax-legal-footer">
        <span>© 2026 LegacyBridge · Hackathon prototype</span>
        <nav aria-label="Legal footer"><Link to="/">Website</Link><Link to={otherPath}>{otherTitle}</Link><a href="#legal-top">Back to top <ArrowUpRight size={11} /></a></nav>
      </footer>
    </div>
  );
}
