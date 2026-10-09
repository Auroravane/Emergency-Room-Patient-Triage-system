export interface VitalSigns {
  heartRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  systolic?: number;
  diastolic?: number;
  temperature?: string | number;
  age: number;
  chiefComplaint: string;
}

export function computeEsiPriority(v: VitalSigns): number {
  const complaint = (v.chiefComplaint || "").toLowerCase();

  // ── Level 1: Immediate life-saving intervention ──────────
  if (v.spo2 !== undefined && v.spo2 > 0 && v.spo2 < 85) return 1;
  if (v.heartRate !== undefined && (v.heartRate > 180 || (v.heartRate > 0 && v.heartRate < 40))) return 1;
  if (v.respiratoryRate !== undefined && (v.respiratoryRate > 40 || (v.respiratoryRate > 0 && v.respiratoryRate < 8))) return 1;
  if (/(cardiac arrest|unresponsive|cyanosis|apnea|severe hemorrhage|agonal)/i.test(complaint)) return 1;

  // ── Level 2: Emergent (high risk, danger zone vitals) ───
  const dangerHR = v.heartRate !== undefined && v.heartRate > 100;
  const dangerRR = v.respiratoryRate !== undefined && v.respiratoryRate > 20;
  const dangerSpO2 = v.spo2 !== undefined && v.spo2 > 0 && v.spo2 < 92;
  const dangerSystolic = v.systolic !== undefined && (v.systolic > 180 || (v.systolic > 0 && v.systolic < 90));

  if (dangerHR || dangerRR || dangerSpO2 || dangerSystolic) return 2;

  // High-risk complaints
  const highRisk = /chest pain|shortness of breath|sob|stroke|altered mental|seizure|anaphylaxis|syncope/i;
  if (highRisk.test(complaint)) return 2;

  // ── Level 3: Urgent (moderate complexity, fever, stable) ─
  const tempNum = typeof v.temperature === "string" ? parseFloat(v.temperature) : v.temperature;
  if (v.heartRate !== undefined && v.heartRate > 90) return 3;
  if (tempNum && tempNum >= 38.5) return 3;
  if (/(abdominal pain|fracture|severe pain|vomiting|dehydration)/i.test(complaint)) return 3;

  // ── Level 4: Less urgent (simple problem / 1 resource) ────
  if (v.heartRate !== undefined && v.heartRate > 80) return 4;
  if (/(laceration|sprain|rash|earache|urinary pain|mild cough)/i.test(complaint)) return 4;

  // ── Level 5: Non-urgent ──────────────────────────────────
  return 5;
}

export const PRIORITY_LABELS: Record<number, { name: string; description: string; badgeClass: string }> = {
  1: {
    name: "Resuscitation (ESI-1)",
    description: "Immediate life-saving intervention needed",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  2: {
    name: "Emergent (ESI-2)",
    description: "High risk, confused/lethargic, or severe pain",
    badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  3: {
    name: "Urgent (ESI-3)",
    description: "Requires multiple diagnostic/treatment resources",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  4: {
    name: "Less Urgent (ESI-4)",
    description: "Expected to require one resource (e.g. X-ray or stitches)",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  5: {
    name: "Non-Urgent (ESI-5)",
    description: "Clinic level visit, medication refill or minor exam",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
};
