'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Play,
  Trash2,
  ExternalLink,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Layers,
  Database,
  ArrowUpRight,
  SlidersHorizontal,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import { Task } from '@/types';

export default function TaskLibraryPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRunTask = async (taskId: string) => {
    try {
      setRunningTaskId(taskId);
      const res = await fetch(`/api/tasks/${taskId}/run`, { method: 'POST' });
      const newRun = await res.json();
      router.push(`/runs/${newRun.id}`);
    } catch (e) {
      console.error('Failed to trigger run:', e);
      setRunningTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setDeletingId(taskId);
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (e) {
      console.error('Failed to delete task:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.sourceUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDestination =
      destinationFilter === 'all' || task.destinationType === destinationFilter;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'write' ? task.isWriteAction : !task.isWriteAction);
    return matchesSearch && matchesDestination && matchesType;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>PIPELINE ORCHESTRATION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
            Task Library
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Browse, manage, and execute automated extraction pipes connected to authorized legacy web systems.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchTasks}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm"
            title="Refresh Task List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-4 shadow-xl shadow-black/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, URLs, or prompts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Destination:</span>
          </div>
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
          >
            <option value="all">All Destinations</option>
            <option value="slack">Slack</option>
            <option value="google_sheets">Google Sheets</option>
            <option value="webhook">Webhook</option>
          </select>

          <div className="flex items-center space-x-2 text-xs text-slate-400 ml-2">
            <span>Pillar:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500 transition"
          >
            <option value="all">All Operations</option>
            <option value="read">Read Only (Auto-Stream)</option>
            <option value="write">Write Mutation (Approval Gate)</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-400" />
          Loading Task Library...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-16 text-center space-y-4 shadow-xl shadow-black/20">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-sans font-bold text-white">No Tasks Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchQuery || destinationFilter !== 'all' || typeFilter !== 'all'
              ? 'No tasks matched your current search filters. Try clearing filters.'
              : 'You have not configured any browser automation tasks yet.'}
          </p>
          <div className="pt-2">
            <Link
              href="/tasks/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create First Task</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-teal-500/40 transition-all duration-300 p-6 shadow-xl shadow-black/20 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      task.isWriteAction
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {task.isWriteAction ? 'APPROVAL GATE REQUIRED' : 'READ-ONLY STREAM'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 uppercase font-semibold">
                      {task.destinationType}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-sans font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                    {task.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {task.prompt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/70 text-xs space-y-2 text-slate-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target Portal:</span>
                    <code className="text-teal-300 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 text-[11px] truncate max-w-[170px]">
                      {task.sourceUrl}
                    </code>
                  </div>
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-slate-500">Schedule:</span>
                    <span className="text-slate-300 font-medium">
                      {task.scheduleHuman || 'Manual trigger only'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/70 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={`/api/feeds/${task.id}/latest`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition"
                    title="Open Instant API Feed"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingId === task.id}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-rose-950/50 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 transition"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleRunTask(task.id)}
                  disabled={runningTaskId === task.id}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                >
                  {runningTaskId === task.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Run Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
