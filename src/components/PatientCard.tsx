import Link from "next/link";
import { PriorityBadge } from "./PriorityBadge";
import { StatusSelect } from "./StatusSelect";
import { Activity, Clock, Heart, Thermometer, User, FileText } from "lucide-react";

export interface PatientQueueItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  clinicalNote: string | null;
  triagePriority: number;
  autoPriority: number;
  status: string;
  createdAt: Date | number;
  heartRate: number | null;
  systolic: number | null;
  diastolic: number | null;
  temperature: string | null;
  respiratoryRate: number | null;
  spo2: number | null;
}

export function PatientCard({
  patient,
  index,
  canManageStatus,
}: {
  patient: PatientQueueItem;
  index: number;
  canManageStatus: boolean;
}) {
  const isPriorityOverridden = patient.triagePriority !== patient.autoPriority;

  return (
    <div className="group relative rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 hover:border-slate-700/80 hover:bg-slate-900/70 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Patient Identifier & Demographics */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 font-mono text-sm font-semibold text-slate-400 border border-slate-700/50">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/dashboard/${patient.id}`}
                className="font-bold text-slate-100 text-base sm:text-lg hover:text-cyan-400 transition-colors"
              >
                {patient.name}
              </Link>
              <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                {patient.age} yrs · <span className="capitalize">{patient.gender}</span>
              </span>
              {isPriorityOverridden && (
                <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Override (Auto ESI-{patient.autoPriority})
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <span className="text-cyan-400 font-semibold">CC:</span> {patient.chiefComplaint}
            </p>
          </div>
        </div>

        {/* Right: Badges and Status Action */}
        <div className="flex items-center gap-3 sm:self-center self-end">
          <PriorityBadge priority={patient.triagePriority} />
          <StatusSelect
            patientId={patient.id}
            currentStatus={patient.status}
            disabled={!canManageStatus}
          />
        </div>
      </div>

      {/* Vital signs bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-4 flex-wrap text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>HR:</span>
          <span className="font-semibold text-slate-200">
            {patient.heartRate ? `${patient.heartRate} bpm` : "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>BP:</span>
          <span className="font-semibold text-slate-200">
            {patient.systolic && patient.diastolic
              ? `${patient.systolic}/${patient.diastolic} mmHg`
              : "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-indigo-400">SpO₂:</span>
          <span className="font-semibold text-slate-200">
            {patient.spo2 ? `${patient.spo2}%` : "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>Temp:</span>
          <span className="font-semibold text-slate-200">
            {patient.temperature ? `${patient.temperature}°C` : "—"}
          </span>
        </div>

        {patient.respiratoryRate && (
          <div className="flex items-center gap-1.5">
            <span>RR:</span>
            <span className="font-semibold text-slate-200">
              {patient.respiratoryRate} /min
            </span>
          </div>
        )}

        {patient.clinicalNote && (
          <div className="ml-auto flex items-center gap-1 text-slate-500 text-[11px] truncate max-w-xs">
            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{patient.clinicalNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
