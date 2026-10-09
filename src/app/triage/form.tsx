"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTriage } from "@/modules/patients/actions";
import { computeEsiPriority, PRIORITY_LABELS } from "@/lib/triage";
import { AlertTriangle, CheckCircle2, Heart, Activity, Thermometer, ShieldAlert } from "lucide-react";

export default function IntakeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; message: string } | null>(null);

  // Live state for interactive ESI calculation preview
  const [vitals, setVitals] = useState({
    name: "",
    age: 35,
    gender: "male",
    chiefComplaint: "",
    clinicalNote: "",
    heartRate: 75,
    systolic: 120,
    diastolic: 80,
    temperature: "37.0",
    respiratoryRate: 16,
    spo2: 98,
    manualPriority: "",
    overrideReason: "",
  });

  const computedAcuity = computeEsiPriority({
    age: Number(vitals.age) || 0,
    chiefComplaint: vitals.chiefComplaint,
    heartRate: Number(vitals.heartRate) || undefined,
    systolic: Number(vitals.systolic) || undefined,
    diastolic: Number(vitals.diastolic) || undefined,
    temperature: vitals.temperature,
    respiratoryRate: Number(vitals.respiratoryRate) || undefined,
    spo2: Number(vitals.spo2) || undefined,
  });

  const effectivePriority = vitals.manualPriority ? Number(vitals.manualPriority) : computedAcuity;
  const isOverridden = !!vitals.manualPriority && Number(vitals.manualPriority) !== computedAcuity;
  const priorityInfo = PRIORITY_LABELS[effectivePriority];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createTriage(formData);

    if (res.ok) {
      setStatusMsg({
        ok: true,
        message: `Patient admitted to queue with priority ESI-${res.priority}!`,
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setStatusMsg({
        ok: false,
        message: res.error || "Failed to process triage intake",
      });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* Real-time ESI Assessment Preview Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real-Time Clinical Decision Support (ESI v5)
          </span>
          <div className="mt-1 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${priorityInfo.badgeClass}`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {priorityInfo.name}
            </span>
            {isOverridden && (
              <span className="text-xs text-amber-400 font-medium">
                (Manual override from Auto ESI-{computedAcuity})
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">{priorityInfo.description}</p>
        </div>

        {computedAcuity <= 2 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>High acuity triggers detected from vitals or presentation.</span>
          </div>
        )}
      </div>

      {/* Patient Demographics */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
          1. Patient Demographics & Identification
        </h3>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Legal Name *</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Jane Doe"
              value={vitals.name}
              onChange={(e) => setVitals({ ...vitals, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Age *</label>
            <input
              name="age"
              type="number"
              required
              min="0"
              max="130"
              value={vitals.age}
              onChange={(e) => setVitals({ ...vitals, age: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender *</label>
            <select
              name="gender"
              value={vitals.gender}
              onChange={(e) => setVitals({ ...vitals, gender: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Unknown</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Chief Complaint (Primary reason for presentation) *
          </label>
          <input
            name="chiefComplaint"
            type="text"
            required
            placeholder="e.g. Sudden severe chest pain radiating to left shoulder"
            value={vitals.chiefComplaint}
            onChange={(e) => setVitals({ ...vitals, chiefComplaint: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
          2. Baseline Triage Vital Signs
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Heart Rate (bpm)</span>
            </label>
            <input
              name="heartRate"
              type="number"
              value={vitals.heartRate}
              onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Systolic BP (mmHg)</span>
            </label>
            <input
              name="systolic"
              type="number"
              value={vitals.systolic}
              onChange={(e) => setVitals({ ...vitals, systolic: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Diastolic BP (mmHg)
            </label>
            <input
              name="diastolic"
              type="number"
              value={vitals.diastolic}
              onChange={(e) => setVitals({ ...vitals, diastolic: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="font-bold text-indigo-400">SpO₂</span>
              <span>Oxygen Saturation (%)</span>
            </label>
            <input
              name="spo2"
              type="number"
              max="100"
              value={vitals.spo2}
              onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Temperature (°C)</span>
            </label>
            <input
              name="temperature"
              type="text"
              value={vitals.temperature}
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Respiratory Rate (/min)
            </label>
            <input
              name="respiratoryRate"
              type="number"
              value={vitals.respiratoryRate}
              onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Clinical Notes & Nurse Override */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
          3. Clinician Evaluation & Acuity Override
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Manual Priority Override (Optional)
            </label>
            <select
              name="manualPriority"
              value={vitals.manualPriority}
              onChange={(e) => setVitals({ ...vitals, manualPriority: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Auto-Assign (ESI-{computedAcuity})</option>
              <option value="1">Level 1 - Resuscitation (Immediate)</option>
              <option value="2">Level 2 - Emergent</option>
              <option value="3">Level 3 - Urgent</option>
              <option value="4">Level 4 - Less Urgent</option>
              <option value="5">Level 5 - Non-Urgent</option>
            </select>
          </div>

          {isOverridden && (
            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1.5">
                Clinical Reason for Acuity Override *
              </label>
              <input
                name="overrideReason"
                type="text"
                required={isOverridden}
                placeholder="e.g. Diaphoretic with pale pallor despite normal vitals"
                value={vitals.overrideReason}
                onChange={(e) => setVitals({ ...vitals, overrideReason: e.target.value })}
                className="w-full rounded-lg border border-amber-500/50 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Clinical Assessment & History Notes
            </label>
            <textarea
              name="clinicalNote"
              rows={3}
              placeholder="Appended clinical observations, known allergies, medical history..."
              value={vitals.clinicalNote}
              onChange={(e) => setVitals({ ...vitals, clinicalNote: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            statusMsg.ok
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-300 border-rose-500/30"
          }`}
        >
          {statusMsg.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{statusMsg.message}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-colors"
        >
          {loading ? "Recording Intake..." : "Admit to Emergency Queue"}
        </button>
      </div>
    </form>
  );
}
