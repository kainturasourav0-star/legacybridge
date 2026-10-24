import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'LegacyBridge | Enterprise Automation for Legacy Web Portals',
  description: 'Describe the task. Keep the old system. Powered by TinyFish Web Agent & Pydantic Validation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-[#080D1A] text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-300">
        <Navigation />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
