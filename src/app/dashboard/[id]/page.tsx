import { getPatientDetail } from "@/modules/patients/queries";
import { getEnv } from "@/lib/env";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusSelect } from "@/components/StatusSelect";
import { getCurrentUser } from "@/lib/current-user";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Heart, Thermometer, Activity, User, ShieldAlert, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  const env = await getEnv();
  const patient = await getPatientDetail(env, id);

  if (!patient) {
    notFound();
  }

  const user = await getCurrentUser();
  const userRole = (user as { role?: string } | null)?.role || "doctor";
  const canManageStatus = ["doctor", "admin"].includes(userRole);

  const latestVital = patient.vitals && patient.vitals.length > 0 ? patient.vitals[0] : null;

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

        {/* Patient Header Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{patient.name}</h1>
                <PriorityBadge priority={patient.triagePriority} />
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Patient ID: <span className="font-mono text-slate-300">{patient.id}</span> · {patient.age} years old ·{" "}
                <span className="capitalize">{patient.gender}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Current Status:</span>
              <StatusSelect
                patientId={patient.id}
                currentStatus={patient.status}
                disabled={!canManageStatus}
              />
            </div>
          </div>

          {/* Clinical Presentation */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Chief Complaint</span>
              </h3>
              <p className="mt-2 text-base font-semibold text-slate-200">{patient.chiefComplaint}</p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Nursing & Intake Notes</span>
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {patient.clinicalNote || "No clinical notes appended at intake."}
              </p>
            </div>
          </div>

          {/* Vitals Panel */}
          <div className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Baseline Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-medium">
                  <Heart className="w-4 h-4" />
                  <span>Heart Rate</span>
                </div>
                <p className="mt-2 text-xl font-bold text-slate-100">
                  {latestVital?.heartRate ? `${latestVital.heartRate} bpm` : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-medium">
                  <Activity className="w-4 h-4" />
                  <span>Blood Pressure</span>
                </div>
                <p className="mt-2 text-xl font-bold text-slate-100">
                  {latestVital?.bloodPressureSystolic && latestVital?.bloodPressureDiastolic
                    ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic}`
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
                  <span className="font-bold">O₂</span>
                  <span>SpO₂ Saturation</span>
                </div>
                <p className="mt-2 text-xl font-bold text-slate-100">
                  {latestVital?.spo2 ? `${latestVital.spo2}%` : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </div>
                <p className="mt-2 text-xl font-bold text-slate-100">
                  {latestVital?.temperature ? `${latestVital.temperature}°C` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
