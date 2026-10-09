"use client";

import { useTransition } from "react";
import { updatePatientStatus } from "@/modules/patients/actions";

interface StatusSelectProps {
  patientId: string;
  currentStatus: string;
  disabled?: boolean;
}

export function StatusSelect({ patientId, currentStatus, disabled }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;
    startTransition(async () => {
      await updatePatientStatus(patientId, nextStatus);
    });
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "in_treatment":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "admitted":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "discharged":
        return "bg-slate-700/50 text-slate-400 border-slate-600";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={disabled || isPending}
        className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${getStatusBg(
          currentStatus
        )} ${isPending ? "opacity-50" : ""}`}
      >
        <option value="waiting" className="bg-slate-900 text-slate-100">Waiting</option>
        <option value="in_treatment" className="bg-slate-900 text-slate-100">In Treatment</option>
        <option value="admitted" className="bg-slate-900 text-slate-100">Admitted</option>
        <option value="discharged" className="bg-slate-900 text-slate-100">Discharged</option>
      </select>
    </div>
  );
}
