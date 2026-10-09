"use client";

import { useState } from "react";
import { Activity, ShieldCheck, Stethoscope, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("nurse.sarah@hospital.er");
  const [password, setPassword] = useState("TriagePass123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const nextUrl = new URLSearchParams(window.location.search).get("next") || "/dashboard";
        window.location.href = nextUrl;
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { message?: string }).message || "Invalid clinical staff credentials.");
        setLoading(false);
      }
    } catch {
      setError("Network or authentication server error");
      setLoading(false);
    }
  }

  const quickFill = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword("TriagePass123!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
          <Activity className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">
          NorthStar Emergency Room
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Departmental Clinical Triage Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifying Credentials..." : "Access ER Console"}
            </button>
          </form>

          {/* Quick Demo Acccount Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5 text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill("nurse.sarah@hospital.er", "nurse")}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nurse Sarah</span>
              </button>

              <button
                type="button"
                onClick={() => quickFill("doctor.chen@hospital.er", "doctor")}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dr. Chen</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">Password: TriagePass123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
