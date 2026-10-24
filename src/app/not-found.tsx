import Link from 'next/link';
import { ArrowLeft, Compass, Home, Layers3, Play, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full p-8 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8b95ff]">
          <Compass className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-[#8a8f98]">
            <span>HTTP 404 · RESOURCE UNRESOLVED</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#f7f8f8] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs md:text-sm text-[#8a8f98] leading-relaxed max-w-sm mx-auto">
            The route or resource you requested does not exist or has been relocated to another service boundary.
          </p>
        </div>

        {/* Quick Navigation Suggestions */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left space-y-2">
          <div className="text-[10px] font-mono text-[#5d626b] uppercase tracking-wider">
            Suggested Endpoints:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[#c7c9cc] hover:text-white transition flex items-center space-x-2"
            >
              <Layers3 className="w-3.5 h-3.5 text-[#8b95ff]" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/drift"
              className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[#c7c9cc] hover:text-white transition flex items-center space-x-2"
            >
              <Search className="w-3.5 h-3.5 text-[#e05252]" />
              <span>Drift Detector</span>
            </Link>
            <Link
              href="/architecture"
              className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[#c7c9cc] hover:text-white transition flex items-center space-x-2"
            >
              <Compass className="w-3.5 h-3.5 text-[#4daf73]" />
              <span>Architecture Map</span>
            </Link>
            <Link
              href="/tasks"
              className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[#c7c9cc] hover:text-white transition flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 text-[#e0a82e]" />
              <span>Task Library</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg bg-[#f7f8f8] hover:bg-white text-[#08090a] font-semibold text-xs transition flex items-center space-x-2 active:scale-95 shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#c7c9cc] hover:text-white font-medium text-xs transition flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Operations Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
