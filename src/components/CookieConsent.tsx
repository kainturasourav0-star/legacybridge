'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, X, Check } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('legacybridge_cookie_consent');
    if (!consent) {
      // Delay display slightly for smooth page entry
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('legacybridge_cookie_consent', 'all');
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('legacybridge_cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 rounded-2xl bg-[#090a0c]/95 border border-white/[0.12] shadow-2xl backdrop-blur-xl text-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2 text-[#8b95ff] font-semibold">
            <Shield className="w-4 h-4" />
            <span>Privacy & Cookie Preferences</span>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-[#8a8f98] hover:text-white transition p-1"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[#8a8f98] leading-relaxed">
          We use strictly necessary cookies to ensure secure authentication, telemetry, and rate-limiting. Optional analytical cookies help us optimize modernization pipelines. Read our{' '}
          <Link href="/privacy" className="text-[#8b95ff] hover:underline font-medium">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms" className="text-[#8b95ff] hover:underline font-medium">
            Terms of Service
          </Link>.
        </p>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center justify-center space-x-1.5 active:scale-95"
            type="button"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Accept All</span>
          </button>
          <button
            onClick={handleAcceptEssential}
            className="flex-1 py-2 px-3.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white font-medium text-xs transition active:scale-95"
            type="button"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
