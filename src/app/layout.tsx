import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/styles/styles.css';
import '@/styles/axis.css';
import { Navigation } from '@/components/Navigation';
import { CookieConsent } from '@/components/CookieConsent';
import { ClerkProvider } from '@clerk/nextjs';
import Link from 'next/link';

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://legacybridge.vercel.app'),
  title: {
    default: 'LegacyBridge — Safe AI Legacy Software Modernization Platform',
    template: '%s | LegacyBridge',
  },
  description:
    'Bridge the gap between legacy software and modern intelligence. Automated AST analysis, business logic recovery, drift regression testing, and safe microservice migration.',
  keywords: [
    'legacy modernization',
    'business logic drift',
    'strangler fig pattern',
    'AST code intelligence',
    'microservices decomposition',
    'reverse regression testing',
    'TinyFish web agents',
  ],
  authors: [{ name: 'LegacyBridge Architectural Team' }],
  creator: 'Sourav Kaintura',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://legacybridge.vercel.app',
    title: 'LegacyBridge — Safe AI Legacy Software Modernization',
    description:
      'Extract business rules from legacy monoliths, detect logic drift with reverse regression suites, and scaffold modern microservices.',
    siteName: 'LegacyBridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegacyBridge — AI Legacy Software Modernization',
    description:
      'Describe the task. Keep the old system. Autonomous cloud browser agents converting brittle portals into resilient REST APIs.',
    creator: '@legacybridge',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder')
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutContent = (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#050505] text-[#f7f8f8] antialiased selection:bg-[#5e6ad2]/30 selection:text-[#b5bcff] flex flex-col justify-between">
        <div className="flex min-h-screen flex-col md:flex-row flex-1">
          <Navigation />
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <main className="flex-1 min-w-0">
              {children}
            </main>

            {/* Platform Master Footer with 2026 Copyright and Verified Links */}
            <footer className="mt-16 border-t border-white/[0.08] bg-[#070708] px-6 md:px-12 py-8 text-xs text-[#8a8f98]">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#4daf73]" />
                  <span className="text-[#c7c9cc] font-medium">LegacyBridge Enterprise Platform</span>
                  <span>·</span>
                  <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <Link href="/about" className="hover:text-white transition">About</Link>
                  <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                  <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                  <Link href="/terms" className="hover:text-white transition">Terms</Link>
                  <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
                  <a href="mailto:support@legacybridge.ai" className="hover:text-[#8b95ff] transition">support@legacybridge.ai</a>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Global GDPR/CCPA Cookie Consent Notice */}
        <CookieConsent />
      </body>
    </html>
  );

  if (isClerkConfigured) {
    return <ClerkProvider>{layoutContent}</ClerkProvider>;
  }

  return layoutContent;
}
