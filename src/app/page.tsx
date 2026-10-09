import Link from "next/link";
import { Activity, ShieldCheck, HeartPulse, Clock, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-wider text-sm uppercase text-slate-100">
              NorthStar <span className="text-cyan-400">ER System</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Staff Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg transition-colors shadow-md shadow-cyan-500/20"
            >
              Open Live Queue
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <main className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cloudflare Workers + D1 Edge-Native Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100">
          Emergency care, <span className="text-cyan-400">prioritized in real-time.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          Full-stack Emergency Severity Index (ESI v5) decision support. Built for emergency department nurses and
          attending physicians with sub-millisecond edge latency, atomic D1 audit trails, and strict clinical RBAC.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/triage"
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
          >
            New Patient Intake
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all"
          >
            Monitor Live ER Board
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <HeartPulse className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="font-bold text-slate-200 mb-1">ESI-v5 Acuity Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic vital sign threshold analysis (SpO₂, HR, RR, BP) highlighting physiological danger zones.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <Clock className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="font-bold text-slate-200 mb-1">Live Queue Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous 7-second synchronization of waiting and in-treatment rooms without websocket server overhead.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-200 mb-1">Audited Compliance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every priority override and clinical status change is atomically bound to the operator session in Cloudflare D1.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        NorthStar Emergency Care System · Cloudflare Workers Edge Monolith
      </footer>
    </div>
  );
}
