'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Lock,
  Key,
  Server,
  Send,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/integrations/status')
      .then((r) => r.json())
      .then((data) => {
        setIntegrations(data.integrations || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="text-xs font-semibold text-teal tracking-wider uppercase mb-1">
          Vault & Credential Layer
        </div>
        <h1 className="text-3xl font-serif font-bold text-ink">Integrations & Credentials Vault</h1>
        <p className="text-sm text-slate-600 mt-1">
          Secure, server-side credential references for TinyFish cloud browser agents, Slack, and Google Sheets.
        </p>
      </div>

      {/* Security Vault Callout */}
      <div className="bg-navy-950 text-white rounded-card border border-navy-800 p-6 shadow-card space-y-3">
        <div className="flex items-center space-x-2 text-mint font-semibold text-sm">
          <Lock className="w-4 h-4" />
          <span>Zero-Exposure Secret Vault Policy</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          LegacyBridge never transmits plain-text API keys, passwords, or session tokens to the browser.
          Secrets are read strictly by server-side runtime environments and masked everywhere in the UI and logs.
          To update credentials, update your secure <code className="text-teal font-mono">.env</code> configuration on Vercel or locally.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-ink">Configured Integration Adapters</h2>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Checking integration status...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((item) => (
              <div
                key={item.provider}
                className="bg-surface rounded-card border border-slate-200/80 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-semibold text-sm text-ink">{item.name}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'connected'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'demo_simulation' || item.status === 'demo_mode'
                          ? 'bg-amber-50 text-amber-dark border border-amber/40'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.description}</p>
                  <div className="text-xs font-mono text-slate-500 pt-1">
                    Key Reference: <span className="text-slate-700 font-bold">{item.maskedRef}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href={item.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
                  >
                    <span>Setup Guide</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions on Demo vs Real Mode */}
      <div className="bg-surface rounded-card border border-slate-200/80 p-6 shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-ink">Operating Mode Guidance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber/40 space-y-2">
            <div className="font-semibold text-amber-dark flex items-center space-x-1.5">
              <span>DEMO MODE (Default Hackathon Presentation)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              When <code className="font-mono text-slate-800">DEMO_MODE=true</code> or API keys are unconfigured,
              LegacyBridge runs deterministic local simulated agent sessions targeting the built-in Acme Inventory ERP.
              Zero Wi-Fi drop risk and 100% reliable live judging demos.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200/60 space-y-2">
            <div className="font-semibold text-emerald-900 flex items-center space-x-1.5">
              <span>REAL MODE (Live Production Agent)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              When <code className="font-mono text-slate-800">DEMO_MODE=false</code> and a valid <code className="font-mono text-slate-800">TINYFISH_API_KEY</code> is supplied,
              the agent spawns real cloud browser sandboxes directly via TinyFish Web Agent API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
