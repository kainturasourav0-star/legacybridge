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
  Zap,
  Activity,
  Cpu,
  Database,
  Code2,
  Copy,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latencyMs: number; message: string }>>({});
  const [copiedEnv, setCopiedEnv] = useState(false);

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
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>VAULT & CREDENTIAL INFRASTRUCTURE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Integrations & Credentials Vault
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Secure, zero-exposure credential references for TinyFish cloud browser agents, Slack, Google Sheets, and databases.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm self-start md:self-auto"
          title="Refresh Integration Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
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

      {/* Integrations Grid with Interactive Testing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-sans font-bold text-white">Configured Integration Adapters</h2>
          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
            {integrations.length} Enterprise Adapters Monitored
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
            Checking integration status...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((item) => {
              const Icon = getProviderIcon(item.provider);
              const testResult = testResults[item.provider];
              const isTesting = testingProvider === item.provider;

              return (
                <div
                  key={item.provider}
                  className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-teal-500/40 p-6 shadow-xl shadow-black/20 space-y-4 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-teal-400 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
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
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                        <div className="text-xs font-mono text-slate-500 pt-1">
                          Key Reference: <span className="text-teal-300 font-bold bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">{item.maskedRef}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleTestConnection(item.provider)}
                        disabled={isTesting}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold transition shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Pinging...</span>
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
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                      >
                        <span>Docs</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  {/* Diagnostic Test Feedback */}
                  {testResult && (
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="font-sans text-slate-300">{testResult.message}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-teal-300 font-bold">
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
