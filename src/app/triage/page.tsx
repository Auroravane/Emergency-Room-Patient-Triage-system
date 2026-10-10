import IntakeForm from "./form";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { getEnv } from "@/lib/env";
import { resolveUserFacility } from "@/lib/facility";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { ArrowLeft, Stethoscope, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/triage");
  }

  const env = await getEnv();
  const facilityCtx = await resolveUserFacility(env, user.id);
  if (!facilityCtx) {
    redirect("/login?error=no_facility_membership");
  }

  if (!hasPermission(facilityCtx.role, "patient", "create")) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-300">
            Only clinical nursing staff or emergency department administrators have authorization to intake patients.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-sm"
          >
            Return to Live Queue
          </Link>
        </div>
      </div>
    );
  }

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
          Facility: <span className="text-cyan-400 font-semibold">{facilityCtx.facilityName}</span> · Capture baseline vitals and clinical presentation.
          Real-time ESI-v5 decision aid computes preliminary acuity with mandatory clinician override rationale.
        </p>

        <IntakeForm />
      </div>
    </div>
  );
}
