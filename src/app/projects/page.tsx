'use client';

import { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Upload,
  Github,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Code2,
  Layers3,
} from 'lucide-react';
import { Project } from '@/types';
import { SAMPLE_MONOLITH_PROJECT } from '@/fixtures/legacy_monolith';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([SAMPLE_MONOLITH_PROJECT]);
  const [importModal, setImportModal] = useState(false);
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<'sample_monolith' | 'github_repo' | 'archive_upload'>('sample_monolith');
  const [repoUrl, setRepoUrl] = useState('https://github.com/acme-corp/legacy-order-monolith');

  const fetchProjects = () => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Acme Logistics Monolith (Branch v2.4)',
          sourceType,
          repoUrl,
          primaryLanguage: 'JavaScript / Node.js',
          detectedFramework: 'Express 4.16 + Knex',
          totalFiles: 34,
          linesOfCode: 8420,
        }),
      });
      if (res.ok) {
        setName('');
        setImportModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>MODERNIZATION WORKSPACES & CODE REPOSITORIES</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Codebase Projects
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-3xl font-normal leading-relaxed">
            Manage imported legacy monolith codebases, connect authorized GitHub repositories, or launch pre-configured sample monoliths for intelligence recovery and drift detection.
          </p>
        </div>

        <button
          onClick={() => setImportModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Import Codebase</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#5e6ad2]/15 text-[#8b95ff] border border-[#5e6ad2]/25">
                  {p.sourceType.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4daf73]/10 text-[#4daf73] border border-[#4daf73]/25 uppercase font-semibold">
                  {p.status}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#f7f8f8]">{p.name}</h3>
              <p className="text-xs text-[#8a8f98] line-clamp-2 leading-relaxed">{p.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#5d626b]">
                <div>Files: <strong className="text-[#f7f8f8]">{p.totalFiles}</strong></div>
                <div>LoC: <strong className="text-[#f7f8f8]">{p.linesOfCode.toLocaleString()}</strong></div>
                <div className="col-span-2 truncate">Stack: <span className="text-[#8a8f98]">{p.detectedFramework}</span></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="/analysis"
                  className="inline-flex items-center space-x-1.5 text-xs text-[#8b95ff] hover:text-white font-medium transition"
                >
                  <span>Explore Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/drift"
                  className="inline-flex items-center space-x-1 text-xs text-[#e05252] hover:text-white font-mono transition"
                >
                  <span>Run Drift Test &rarr;</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/[0.12] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-semibold text-[#f7f8f8]">Import Legacy Codebase</h3>
              <button
                onClick={() => setImportModal(false)}
                className="text-xs text-[#8a8f98] hover:text-white font-mono"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#8a8f98] uppercase block mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Enterprise ERP Monolith"
                  className="w-full bg-[#050505] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#8b95ff]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8a8f98] uppercase block mb-1.5">Source Ingestion Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('sample_monolith')}
                    className={`p-3 rounded-lg border text-xs font-mono flex flex-col items-center gap-1.5 transition ${
                      sourceType === 'sample_monolith'
                        ? 'bg-[#5e6ad2]/20 border-[#8b95ff] text-[#f7f8f8]'
                        : 'bg-[#050505] border-white/[0.08] text-[#8a8f98]'
                    }`}
                  >
                    <Layers3 className="w-4 h-4 text-[#8b95ff]" />
                    <span>Demo Monolith</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('github_repo')}
                    className={`p-3 rounded-lg border text-xs font-mono flex flex-col items-center gap-1.5 transition ${
                      sourceType === 'github_repo'
                        ? 'bg-[#5e6ad2]/20 border-[#8b95ff] text-[#f7f8f8]'
                        : 'bg-[#050505] border-white/[0.08] text-[#8a8f98]'
                    }`}
                  >
                    <Github className="w-4 h-4 text-[#8b95ff]" />
                    <span>GitHub Repo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('archive_upload')}
                    className={`p-3 rounded-lg border text-xs font-mono flex flex-col items-center gap-1.5 transition ${
                      sourceType === 'archive_upload'
                        ? 'bg-[#5e6ad2]/20 border-[#8b95ff] text-[#f7f8f8]'
                        : 'bg-[#050505] border-white/[0.08] text-[#8a8f98]'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-[#8b95ff]" />
                    <span>ZIP Archive</span>
                  </button>
                </div>
              </div>

              {sourceType === 'github_repo' && (
                <div>
                  <label className="text-xs font-mono text-[#8a8f98] uppercase block mb-1.5">Repository URL</label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-[#050505] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#8b95ff]"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setImportModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] text-xs text-[#8a8f98] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#f7f8f8] text-[#08090a] font-semibold text-xs hover:bg-white"
                >
                  Initialize Ingestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
