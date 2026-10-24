import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — LegacyBridge',
  description: 'Legal terms governing the use of the LegacyBridge software intelligence platform and API feeds.',
};

export default function TermsPage() {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#f7f8f8] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-[#8a8f98]">
          EFFECTIVE DATE: OCTOBER 24, 2026 · VERSION 2.4
        </p>
      </div>

      <div className="space-y-8 text-xs md:text-sm text-[#8a8f98] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using LegacyBridge (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">2. Proprietary Codebase Ownership & Confidentiality</h2>
          <p>
            You retain 100% intellectual property ownership of your source code, databases, business rules, and extracted data schemas. LegacyBridge does not claim any ownership over code ingested into the AST analysis engine. We will never sell, lease, or use your proprietary software to train public foundation models without your explicit, written consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">3. Authorized Agent Access & Credentials</h2>
          <p>
            When utilizing TinyFish cloud browser agents to automate internal web portals, you represent and warrant that you hold legitimate authorization, valid user credentials, and legal permission to access the target portals. You agree not to configure tasks targeting third-party domains without their express authorization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">4. Service Level Guarantees & Drift Verification</h2>
          <p>
            While the Business Logic Drift Detector provides automated regression testing between monoliths and microservices, software migration carries inherent engineering risk. Developers are obligated to review and approve all proposed changes prior to production deployment. LegacyBridge is provided &ldquo;as is&rdquo; without warranties of absolute defect-free operation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">5. Limitation of Liability</h2>
          <p>
            In no event shall LegacyBridge, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, or goodwill, arising out of your access to or use of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">6. Termination</h2>
          <p>
            We may terminate or suspend your access immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f7f8f8]">7. Contact & Legal Inquiries</h2>
          <p>
            For any legal or contractual questions regarding these terms, please contact our counsel at{' '}
            <a href="mailto:legal@legacybridge.ai" className="text-[#8b95ff] hover:underline">
              legal@legacybridge.ai
            </a>.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs">
        <Link href="/" className="text-[#8a8f98] hover:text-white transition">
          &larr; Return to Home
        </Link>
        <Link href="/privacy" className="text-[#8b95ff] hover:underline">
          View Privacy Policy &rarr;
        </Link>
      </div>
    </div>
  );
}
