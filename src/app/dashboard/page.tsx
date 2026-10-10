import { getPatientQueue } from "@/modules/patients/queries";
import { getEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/current-user";
import { resolveUserFacility } from "@/lib/facility";
import { PatientCard } from "@/components/PatientCard";
import { DashboardPoller } from "@/components/DashboardPoller";
import { SignOutButton } from "@/components/SignOutButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, Activity, Users, ShieldAlert, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const env = await getEnv();
  const facilityCtx = await resolveUserFacility(env, user.id);
  if (!facilityCtx) {
    redirect("/login?error=no_facility_membership");
  }

  const queue = await getPatientQueue(env, facilityCtx.facilityId);
  const userRole = facilityCtx.role;
  const canIntake = ["nurse", "admin"].includes(userRole);
  const canManageStatus = ["doctor", "admin"].includes(userRole);

  const criticalCount = queue.filter((p) => p.triagePriority === 1).length;
  const emergentCount = queue.filter((p) => p.triagePriority === 2).length;
  const waitingCount = queue.filter((p) => p.status === "waiting").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">NorthStar ER</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  {facilityCtx.facilityName}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-200">Clinical Triage Console</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user?.name || "Clinician on duty"}</span>
              <span className="text-xs text-cyan-400 capitalize">{userRole} role</span>
            </div>

            {canIntake && (
              <Link
                href="/triage"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Intake</span>
              </Link>
            )}

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* KPI Acuity summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active In Queue</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-100">{queue.length}</p>
            <span className="text-[11px] text-slate-500">{waitingCount} waiting for room</span>
          </div>

          <div className="rounded-xl border border-red-950/60 bg-red-950/20 p-4">
            <div className="flex items-center justify-between text-red-400 text-xs font-medium">
              <span>ESI-1 Resuscitation</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-400">{criticalCount}</p>
            <span className="text-[11px] text-red-400/70">Immediate intervention</span>
          </div>

          <div className="rounded-xl border border-orange-950/60 bg-orange-950/20 p-4">
            <div className="flex items-center justify-between text-orange-400 text-xs font-medium">
              <span>ESI-2 Emergent</span>
              <Activity className="w-4 h-4 text-orange-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-orange-400">{emergentCount}</p>
            <span className="text-[11px] text-orange-400/70">High danger zone vitals</span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Average Wait Target</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-400">&lt; 15 min</p>
            <span className="text-[11px] text-slate-500">Under clinical threshold</span>
          </div>
        </div>

        {/* Live Queue Table/Stream */}
        <DashboardPoller>
          <div className="space-y-3">
            {queue.map((patient, index) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                index={index}
                canManageStatus={canManageStatus}
              />
            ))}

            {queue.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">All clear</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  There are no patients awaiting intake or treatment in this department queue.
                </p>
                {canIntake && (
                  <Link
                    href="/triage"
                    className="inline-flex items-center gap-2 mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Intake First Patient</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </DashboardPoller>
      </main>
    </div>
  );
}
