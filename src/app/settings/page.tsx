'use client';

import { useEffect, useState } from 'react';
import {
  ExternalLink,
  Lock,
  RefreshCw,
  Activity,
  Cpu,
  Database,
  Code2,
  CheckCircle2,
  KeyRound,
  Send,
  FileSpreadsheet,
  Zap,
  Server,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latencyMs: number; message: string }>>({});

  const fetchIntegrations = () => {
    setLoading(true);
    fetch('/api/integrations/status')
      .then((r) => r.json())
      .then((data) => {
        setIntegrations(data.integrations || []);
        setDemoMode(data.demoMode ?? true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestConnection = async (provider: string) => {
    try {
      setTestingProvider(provider);
      const res = await fetch('/api/integrations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const result = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [provider]: result,
      }));
    } catch (e: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, latencyMs: 0, message: e.message || 'Connection test failed' },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'nvidia':
        return Sparkles;
      case 'tinyfish':
        return Cpu;
      case 'slack':
        return Send;
      case 'google_sheets':
        return FileSpreadsheet;
      case 'webhook':
        return Zap;
      case 'postgres':
        return Database;
      case 'llm':
        return Code2;
      default:
        return Server;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <KeyRound className="w-3.5 h-3.5 text-[#8b95ff]" />
            <span>VAULT & CREDENTIAL INFRASTRUCTURE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Integrations & Credentials Vault
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-2xl font-normal leading-relaxed">
            Secure, zero-exposure credential references for TinyFish cloud browser agents, Slack, Google Sheets, and databases.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition shadow-sm self-start md:self-auto"
          title="Refresh Integration Status"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b95ff]' : ''}`} />
        </button>
      </div>

      {/* Security Vault Callout */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-2">
        <div className="flex items-center space-x-2 text-[#8b95ff] font-semibold text-xs font-mono uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Exposure Secret Vault Policy</span>
        </div>
        <p className="text-xs text-[#8a8f98] leading-relaxed max-w-3xl">
          LegacyBridge never transmits plain-text API keys, passwords, or session tokens to the browser.
          Secrets are read strictly by server-side runtime environments and masked everywhere in the UI and logs.
          To update credentials, update your secure <code className="text-[#8b95ff] font-mono bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.08]">.env</code> configuration on Vercel, Railway, or locally.
        </p>
      </div>

      {/* Integrations Grid with Interactive Testing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#f7f8f8]">Configured Integration Adapters</h2>
          <span className="text-[10px] font-mono text-[#8b95ff] bg-[#5e6ad2]/15 px-2.5 py-1 rounded-full border border-[#5e6ad2]/25">
            {integrations.length} Enterprise Adapters Monitored
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#8a8f98]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8b95ff]" />
            Checking integration status...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {integrations.map((item) => {
              const Icon = getProviderIcon(item.provider);
              const testResult = testResults[item.provider];
              const isTesting = testingProvider === item.provider;

              return (
                <div
                  key={item.provider}
                  className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.18] p-5 space-y-3 transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 text-[#8b95ff] mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <span className="font-semibold text-sm text-[#f7f8f8]">{item.name}</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider uppercase border ${
                              item.status === 'connected'
                                ? 'bg-[#4daf73]/10 text-[#4daf73] border-[#4daf73]/30'
                                : item.status === 'demo_simulation' || item.status === 'demo_mode'
                                ? 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30'
                                : 'bg-white/[0.04] text-[#5d626b] border-white/[0.08]'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-[#8a8f98] leading-relaxed max-w-xl">{item.description}</p>
                        <div className="text-[11px] font-mono text-[#5d626b] pt-0.5">
                          Key Reference: <span className="text-[#8b95ff] font-medium bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.08]">{item.maskedRef}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleTestConnection(item.provider)}
                        disabled={isTesting}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#f7f8f8] hover:bg-white text-[#08090a] text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                        type="button"
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Pinging…</span>
                          </>
                        ) : (
                          <>
                            <Activity className="w-3.5 h-3.5" />
                            <span>Test Connection</span>
                          </>
                        )}
                      </button>

                      <a
                        href={item.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] text-xs font-medium text-[#c7c9cc] transition"
                      >
                        <span>Docs</span>
                        <ExternalLink className="w-3 h-3 text-[#5d626b]" />
                      </a>
                    </div>
                  </div>

                  {/* Diagnostic Test Feedback */}
                  {testResult && (
                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2 text-[#4daf73]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-sans text-[#c7c9cc]">{testResult.message}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-black border border-white/[0.08] text-[#8b95ff] font-semibold text-[11px]">
                        {testResult.latencyMs}ms
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Operating Mode Guidance */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-6 space-y-3">
        <h3 className="font-semibold text-sm text-[#f7f8f8]">Operating Mode Guidance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <div className="font-semibold text-[#e0a82e] flex items-center space-x-1.5">
              <span>DEMO MODE (Default Presentation Mode)</span>
            </div>
            <p className="text-[#8a8f98] leading-relaxed text-xs">
              When <code className="font-mono text-[#8b95ff] bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.08]">DEMO_MODE=true</code> or keys are unconfigured,
              LegacyBridge runs deterministic local simulated agent sessions targeting the built-in Acme Inventory ERP.
              Zero Wi-Fi drop risk and 100% reliable live judging demos.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <div className="font-semibold text-[#4daf73] flex items-center space-x-1.5">
              <span>REAL MODE (Live Production Agent)</span>
            </div>
            <p className="text-[#8a8f98] leading-relaxed text-xs">
              When <code className="font-mono text-[#8b95ff] bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.08]">DEMO_MODE=false</code> and a valid <code className="font-mono text-[#8b95ff] bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.08]">TINYFISH_API_KEY</code> is supplied,
              the agent spawns real cloud browser sandboxes directly via TinyFish Web Agent API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
