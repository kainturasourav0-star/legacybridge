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
  AlertCircle,
  RefreshCw,
  Zap
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
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/60">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>VAULT & CREDENTIAL INFRASTRUCTURE</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
          Integrations & Credentials Vault
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
          Secure, zero-exposure credential references for TinyFish cloud browser agents, Slack, and Google Sheets.
        </p>
      </div>

      {/* Security Vault Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 p-6 md:p-8 shadow-2xl shadow-black/40 space-y-3">
        <div className="flex items-center space-x-2.5 text-teal-300 font-bold text-sm">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-sans">Zero-Exposure Secret Vault Policy</span>
        </div>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
          LegacyBridge never transmits plain-text API keys, passwords, or session tokens to the browser.
          Secrets are read strictly by server-side runtime environments and masked everywhere in the UI and logs.
          To update credentials, update your secure <code className="text-teal-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">.env</code> configuration on Vercel or locally.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-sans font-bold text-white">Configured Integration Adapters</h2>
          <span className="text-xs font-mono text-slate-400">All Adapters Monitored</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
            Checking integration status...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((item) => (
              <div
                key={item.provider}
                className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-teal-500/40 p-6 shadow-xl shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-200"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-white">{item.name}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                        item.status === 'connected'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'demo_simulation' || item.status === 'demo_mode'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  <div className="text-xs font-mono text-slate-500 pt-1">
                    Key Reference: <span className="text-teal-300 font-bold bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">{item.maskedRef}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href={item.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                  >
                    <span>Setup Guide</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions on Demo vs Real Mode */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl shadow-black/20 space-y-4">
        <h3 className="font-sans font-bold text-base text-white">Operating Mode Guidance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="font-bold text-amber-300 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>DEMO MODE (Default Hackathon Presentation)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              When <code className="font-mono text-teal-300 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">DEMO_MODE=true</code> or API keys are unconfigured,
              LegacyBridge runs deterministic local simulated agent sessions targeting the built-in Acme Inventory ERP.
              Zero Wi-Fi drop risk and 100% reliable live judging demos.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>REAL MODE (Live Production Agent)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              When <code className="font-mono text-teal-300 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">DEMO_MODE=false</code> and a valid <code className="font-mono text-teal-300 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">TINYFISH_API_KEY</code> is supplied,
              the agent spawns real cloud browser sandboxes directly via TinyFish Web Agent API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
