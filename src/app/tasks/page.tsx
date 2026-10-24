'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Play,
  Trash2,
  ExternalLink,
  RefreshCw,
  Layers3,
  Copy,
  Check,
  SlidersHorizontal,
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
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [copiedFeedId, setCopiedFeedId] = useState<string | null>(null);

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

  const handleCloneTask = async (task: Task) => {
    try {
      setCloningId(task.id);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${task.name} (Copy)`,
          prompt: task.prompt,
          sourceUrl: task.sourceUrl,
          destinationType: task.destinationType,
          destinationConfig: task.destinationConfig,
          expectedSchema: task.expectedSchema,
          scheduleHuman: task.scheduleHuman,
          isWriteAction: task.isWriteAction,
        }),
      });
      if (res.ok) {
        await fetchTasks();
      }
    } catch (e) {
      console.error('Failed to clone task:', e);
    } finally {
      setCloningId(null);
    }
  };

  const handleCopyFeed = (taskId: string) => {
    const url = `${window.location.origin}/api/feeds/${taskId}/latest`;
    navigator.clipboard.writeText(url);
    setCopiedFeedId(taskId);
    setTimeout(() => setCopiedFeedId(null), 2000);
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] text-xs font-mono font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4daf73] shadow-[0_0_6px_rgba(77,175,115,0.6)]" />
            <span>PIPELINE ORCHESTRATION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-[#f7f8f8] tracking-tight">
            Task Library
          </h1>
          <p className="text-sm md:text-base text-[#8a8f98] mt-2 max-w-2xl font-normal leading-relaxed">
            Browse, manage, and execute automated extraction pipes connected to authorized legacy web systems.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchTasks}
            className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition shadow-sm"
            title="Refresh Task List"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#8b95ff]' : ''}`} />
          </button>
          <Link
            href="/tasks/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs tracking-tight transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5d626b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, URLs, or prompts..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#f7f8f8] placeholder-[#5d626b] focus:outline-none focus:border-[#8b95ff] transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-[#8a8f98]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#5d626b]" />
            <span>Destination:</span>
          </div>
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#c7c9cc] focus:outline-none focus:border-[#8b95ff] transition"
          >
            <option value="all">All Destinations</option>
            <option value="slack">Slack</option>
            <option value="google_sheets">Google Sheets</option>
            <option value="webhook">Webhook</option>
          </select>

          <div className="flex items-center space-x-2 text-xs text-[#8a8f98] ml-2">
            <span>Pillar:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/40 text-xs text-[#c7c9cc] focus:outline-none focus:border-[#8b95ff] transition"
          >
            <option value="all">All Operations</option>
            <option value="read">Read Only (Auto-Stream)</option>
            <option value="write">Write Mutation (Approval Gate)</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8a8f98]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8b95ff]" />
          Loading Task Library...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#8b95ff] flex items-center justify-center mx-auto">
            <Layers3 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#f7f8f8]">No Tasks Found</h3>
          <p className="text-xs text-[#8a8f98] max-w-md mx-auto">
            {searchQuery || destinationFilter !== 'all' || typeFilter !== 'all'
              ? 'No tasks matched your current search filters. Try clearing filters.'
              : 'You have not configured any browser automation tasks yet.'}
          </p>
          <div className="pt-2">
            <Link
              href="/tasks/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create First Task</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider uppercase border ${
                      task.isWriteAction
                        ? 'bg-[#e0a82e]/10 text-[#e0a82e] border-[#e0a82e]/30'
                        : 'bg-[#5e6ad2]/10 text-[#8b95ff] border-[#5e6ad2]/30'
                    }`}
                  >
                    {task.isWriteAction ? 'APPROVAL GATE' : 'READ-ONLY'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#8a8f98] uppercase">
                    {task.destinationType}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#f7f8f8] group-hover:text-[#8b95ff] transition-colors line-clamp-1">
                    {task.name}
                  </h3>
                  <p className="text-xs text-[#8a8f98] line-clamp-2 mt-1 leading-relaxed">
                    {task.prompt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] text-xs space-y-1.5 text-[#5d626b] font-mono">
                  <div className="flex items-center justify-between">
                    <span>Target:</span>
                    <code className="text-[#c7c9cc] bg-black/40 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[170px]">
                      {task.sourceUrl}
                    </code>
                  </div>
                  <div className="flex items-center justify-between font-sans">
                    <span>Schedule:</span>
                    <span className="text-[#8a8f98]">
                      {task.scheduleHuman || 'Manual trigger'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  <a
                    href={`/api/feeds/${task.id}/latest`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition"
                    title="Open Instant Feed"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopyFeed(task.id)}
                    className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] text-[#8a8f98] hover:text-white transition"
                    title="Copy Feed URL"
                    type="button"
                  >
                    {copiedFeedId === task.id ? <Check className="w-3.5 h-3.5 text-[#4daf73]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCloneTask(task)}
                    disabled={cloningId === task.id}
                    className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] text-[#8a8f98] hover:text-[#8b95ff] transition"
                    title="Clone Task"
                    type="button"
                  >
                    <Layers3 className={`w-3.5 h-3.5 ${cloningId === task.id ? 'animate-pulse text-[#8b95ff]' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingId === task.id}
                    className="p-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-[#e05252]/10 hover:border-[#e05252]/30 hover:text-[#e05252] text-[#5d626b] transition"
                    title="Delete Task"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleRunTask(task.id)}
                  disabled={runningTaskId === task.id}
                  className="px-3 py-1.5 rounded-md bg-[#f7f8f8] hover:bg-white text-[#08090a] text-xs font-semibold transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
                  type="button"
                >
                  {runningTaskId === task.id ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Running…</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run</span>
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
