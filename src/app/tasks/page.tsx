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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
        if (selectedTask?.id === taskId) setSelectedTask(null);
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal tracking-wider uppercase mb-1">
            Pipeline Orchestration
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">
            Task Library
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse, manage, and execute automated extraction pipes connected to legacy web systems.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTasks}
            className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            title="Refresh Task List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-teal text-white hover:bg-teal-700 font-semibold text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-card p-4 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, URLs, or prompts..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Destination:</span>
          </div>
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            <option value="all">All Destinations</option>
            <option value="slack">Slack</option>
            <option value="google_sheets">Google Sheets</option>
            <option value="webhook">Webhook</option>
          </select>

          <div className="flex items-center space-x-2 text-xs text-slate-500 ml-2">
            <span>Pillar:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            <option value="all">All Operations</option>
            <option value="read">Read Only (Auto-Stream)</option>
            <option value="write">Write Mutation (Approval Gate)</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal" />
          Loading Task Library...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-surface rounded-card border border-slate-200/80 p-12 text-center space-y-4 shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-ink">No Tasks Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery || destinationFilter !== 'all' || typeFilter !== 'all'
              ? 'No tasks matched your current search filters. Try clearing filters.'
              : 'You have not configured any browser automation tasks yet.'}
          </p>
          <div className="pt-2">
            <Link
              href="/tasks/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-teal text-white hover:bg-teal-700 font-semibold text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Task</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface rounded-card border border-slate-200/80 hover:border-teal/50 transition-all p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:shadow-card group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                      task.isWriteAction
                        ? 'bg-amber-50 text-amber-dark border border-amber/40'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {task.isWriteAction ? 'APPROVAL GATE REQUIRED' : 'READ-ONLY STREAM'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-medium">
                      {task.destinationType}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-ink group-hover:text-teal transition-colors line-clamp-1">
                    {task.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {task.prompt}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Target Portal:</span>
                    <code className="text-slate-800 font-mono text-[11px] truncate max-w-[160px]">
                      {task.sourceUrl}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Schedule:</span>
                    <span className="text-slate-700 font-medium">
                      {task.scheduleHuman || 'Manual trigger only'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <a
                    href={`/api/feeds/${task.id}/latest`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                    title="Open Instant API Feed"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingId === task.id}
                    className="p-1.5 rounded border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleRunTask(task.id)}
                  disabled={runningTaskId === task.id}
                  className="px-3.5 py-1.5 rounded-lg bg-teal hover:bg-teal-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  {runningTaskId === task.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
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
