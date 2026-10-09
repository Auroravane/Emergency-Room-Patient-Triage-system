"use client";

import { useState } from "react";
import { Activity, ShieldCheck, Stethoscope, Lock, Mail, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"nurse" | "doctor" | "admin">("nurse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = isSignUp ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
      const payload = isSignUp
        ? { name, email, password, role }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (isSignUp) {
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => {
            const nextUrl = new URLSearchParams(window.location.search).get("next") || "/dashboard";
            window.location.href = nextUrl;
          }, 800);
        } else {
          const nextUrl = new URLSearchParams(window.location.search).get("next") || "/dashboard";
          window.location.href = nextUrl;
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { message?: string }).message || (isSignUp ? "Failed to create account." : "Invalid credentials. If this is your first time, please sign up."));
        setLoading(false);
      }
    } catch {
      setError("Network or authentication server error");
      setLoading(false);
    }
  }

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
          {/* Toggle between Sign In and Sign Up */}
          <div className="flex rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(""); setSuccess(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                !isSignUp ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(""); setSuccess(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                isSignUp ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins, RN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="clinician@hospital.er"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Clinical Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "nurse" | "doctor" | "admin")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="nurse">Nurse (Intake & Triage)</option>
                  <option value="doctor">Doctor (Attending / Status & Treatment)</option>
                  <option value="admin">Admin / CMO (Full Department Access)</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-colors mt-2"
            >
              {loading
                ? isSignUp ? "Creating account..." : "Verifying..."
                : isSignUp ? "Create Staff Account" : "Access ER Console"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
