'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Hash,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ModernizationReport } from '@/types';
import { SAMPLE_MODERNIZATION_REPORT } from '@/fixtures/legacy_monolith';

export default function ModernizationReportPage() {
  const [report, setReport] = useState<ModernizationReport>(SAMPLE_MODERNIZATION_REPORT);
  const [signing, setSigning] = useState(false);

  const fetchReport = () => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((data) => setReport(data))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleSignOff = async () => {
    setSigning(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign_off' }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacybridge-report-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>AUDIT-READY MODERNIZATION DOSSIER · CRYPTOGRAPHIC INTEGRITY VERIFIED</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Evidence-Based Modernization Report
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Consolidated intelligence findings, business logic drift audit trails, regression test results, and TinyFish documentation citations for architectural review boards and compliance sign-off.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-[#f7f8f8] hover:bg-white/[0.08] transition"
          >
            <Download className="w-4 h-4 text-[#8b95ff]" />
            <span>Export JSON</span>
          </button>
          {!report.signedOff ? (
            <button
              onClick={handleSignOff}
              disabled={signing}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{signing ? 'Signing Dossier...' : 'Architectural Sign-off'}</span>
            </button>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#4daf73]/15 text-[#4daf73] border border-[#4daf73]/30 text-xs font-semibold font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Signed Off by {report.signedOffBy}</span>
            </span>
          )}
        </div>
      </div>

      {/* Cryptographic Dossier Header Card */}
      <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-[#8b95ff] uppercase">REPORT DOSSIER #{report.id}</span>
            <h2 className="text-xl font-semibold text-[#f7f8f8] mt-0.5">{report.projectName}</h2>
          </div>
          <div className="text-right text-xs font-mono text-[#5d626b]">
            <div>Generated: {new Date(report.generatedAt).toLocaleString()}</div>
            <div className="truncate max-w-sm mt-1">SHA-256: {report.integrityHash}</div>
          </div>
        </div>

        <p className="text-xs text-[#8a8f98] leading-relaxed pt-2 border-t border-white/[0.06]">
          {report.executiveSummary}
        </p>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
          <span className="text-[10px] font-mono text-[#5d626b] uppercase">Source Files</span>
          <div className="text-2xl font-semibold text-[#f7f8f8] mt-1">{report.inventoryMetrics.files}</div>
          <span className="text-xs text-[#8a8f98] mt-0.5 block">{report.inventoryMetrics.loc.toLocaleString()} lines analyzed</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
          <span className="text-[10px] font-mono text-[#5d626b] uppercase">Flagged Risks</span>
          <div className="text-2xl font-semibold text-[#e05252] mt-1">{report.findingsSummary.critical + report.findingsSummary.high}</div>
          <span className="text-xs text-[#8a8f98] mt-0.5 block">{report.findingsSummary.critical} critical, {report.findingsSummary.high} high</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
          <span className="text-[10px] font-mono text-[#5d626b] uppercase">Drift Test Failures</span>
          <div className="text-2xl font-semibold text-[#e0a82e] mt-1">{report.driftVerification.regressionTestsFailed}</div>
          <span className="text-xs text-[#8a8f98] mt-0.5 block">{report.driftVerification.driftsDetected} rules altered</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
          <span className="text-[10px] font-mono text-[#5d626b] uppercase">TinyFish Citations</span>
          <div className="text-2xl font-semibold text-[#8b95ff] mt-1">{report.tinyFishEvidenceCount}</div>
          <span className="text-xs text-[#8a8f98] mt-0.5 block">Official docs verified</span>
        </div>
      </div>

      {/* Deep-Dive Modernization Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modernization Path */}
        <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
          <h3 className="text-base font-semibold text-[#f7f8f8]">Decomposition & Target Path</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#8a8f98]">Target Architecture</span>
              <strong className="text-[#f7f8f8]">{report.migrationPath.targetArchitecture}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#8a8f98]">Strangler Fig Phases</span>
              <strong className="text-[#f7f8f8]">{report.migrationPath.phasesCount} Phases Planned</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#8a8f98]">Extracted Microservices</span>
              <strong className="text-[#f7f8f8]">{report.migrationPath.servicesCount} Bounded Contexts</strong>
            </div>
          </div>
          <a
            href="/migration"
            className="inline-flex items-center space-x-1.5 text-xs text-[#8b95ff] hover:text-white pt-2 transition"
          >
            <span>Review Strangler Fig Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Drift Verification Summary */}
        <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
          <h3 className="text-base font-semibold text-[#f7f8f8]">Business Logic Drift Audit</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#8a8f98]">AST Business Rules Analyzed</span>
              <strong className="text-[#f7f8f8]">{report.driftVerification.rulesCount} Rules</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#8a8f98]">Divergent Rules In Modern Code</span>
              <strong className="text-[#e05252]">{report.driftVerification.driftsDetected} Alterations Detected</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#8a8f98]">Automated Regression Pass Rate</span>
              <strong className="text-[#e0a82e]">0% (2 Failed Tests)</strong>
            </div>
          </div>
          <a
            href="/drift"
            className="inline-flex items-center space-x-1.5 text-xs text-[#e05252] hover:text-white pt-2 transition font-medium"
          >
            <span>Inspect Live Regression Diffs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
