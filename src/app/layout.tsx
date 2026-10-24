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
    <html lang="en">
      <body className="flex min-h-screen bg-offwhite text-ink antialiased">
        <Navigation />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
