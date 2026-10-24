import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — LegacyBridge',
  description: 'How LegacyBridge protects your personal information, enterprise data, and source code telemetry.',
};

export default function PrivacyPage() {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#f7f8f8] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-[#8a8f98]">
          LAST UPDATED: OCTOBER 24, 2026 · GDPR & CCPA COMPLIANT
        </p>
      </div>

      <div className="space-y-8 text-xs md:text-sm text-[#8a8f98] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">1. Information We Collect</h2>
          <p>
            We collect information strictly necessary to provide intelligent software analysis, regression verification, and secure API feed generation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#c7c9cc]">
            <li><strong>Account Data:</strong> Email address, name, and organization name provided during registration.</li>
            <li><strong>Monolith Metadata:</strong> AST file counts, module dependency graphs, and rule logic schemas. Source code is parsed ephemerally.</li>
            <li><strong>Vault Credentials:</strong> Portal usernames and secrets stored in TinyFish Vault are encrypted with AES-256 and never logged in plain text.</li>
            <li><strong>Telemetry:</strong> Execution status, latency metrics, and error digests without sensitive PII or authorization tokens.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">2. How We Protect Your Data</h2>
          <p>
            We enforce defense-in-depth security across all layers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#c7c9cc]">
            <li>All data in transit is encrypted using modern TLS 1.3 with Strict-Transport-Security (HSTS).</li>
            <li>Database isolation is enforced with PostgreSQL Row-Level Security (RLS) policies.</li>
            <li>Audit logs automatically mask all bearer tokens, passwords, and sensitive credit parameters.</li>
            <li>Server-side request forgery (SSRF) filters block access to internal metadata and private IP spaces.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">3. GDPR & European Privacy Rights</h2>
          <p>
            If you reside in the European Economic Area (EEA), you possess statutory rights under the General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#c7c9cc]">
            <li>Right to access the personal data we hold about you.</li>
            <li>Right to rectify incorrect or incomplete information.</li>
            <li>Right to erasure (&ldquo;Right to be Forgotten&rdquo;) of your account and associated task runs.</li>
            <li>Right to data portability in structured JSON formats.</li>
          </ul>
          <p>
            To exercise any of these rights, contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@legacybridge.ai" className="text-[#8b95ff] hover:underline">
              privacy@legacybridge.ai
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">4. California Consumer Privacy Act (CCPA)</h2>
          <p>
            We strictly adhere to the CCPA. We do not sell personal information to third parties, nor do we exchange consumer information for monetary or other valuable consideration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">5. Cookie & Session Storage</h2>
          <p>
            We use essential session cookies strictly required for authentication, CSRF mitigation, and edge rate-limiting. You may manage your cookie preferences at any time using our Cookie Consent banner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">6. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material modifications will be notified via our dashboard banner and email notifications.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs">
        <Link href="/" className="text-[#8a8f98] hover:text-white transition">
          &larr; Return to Home
        </Link>
        <Link href="/terms" className="text-[#8b95ff] hover:underline">
          View Terms of Service &rarr;
        </Link>
      </div>
    </div>
  );
}
