import IntakeForm from "./form";
import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";

export default function TriagePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Queue</span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Patient Triage Intake</h1>
        </div>
        <p className="text-sm text-slate-400">
          Rapidly capture vital signs and clinical presentation. Real-time Emergency Severity Index (ESI-v5)
          evaluates physiological danger zones with nurse override authority.
        </p>

        <IntakeForm />
      </div>
    </div>
  );
}
