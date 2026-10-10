/**
 * NorthStar ER Clinical Decision-Support Heuristic
 * Version: v0.9-preliminary (Engineering Decision Support Aid)
 *
 * CLINICAL SAFETY NOTICE & STATUTORY LIMITATIONS:
 * 1. This algorithm is an engineering triage decision-support aid modeled on the Emergency
 *    Severity Index (ESI) framework. It has NOT been certified or independently validated as an
 *    autonomous medical device or diagnostic engine.
 * 2. Formal ESI-v5 requires qualitative clinician judgment (Step B: High-risk situation,
 *    severe pain/distress, lethargy) and resource estimation (Step C: Expected imaging, lab, IV fluids).
 *    In this software heuristic, resource estimation is not fully modeled, and keyword matching is
 *    used as a conservative physiological safety trigger.
 * 3. Qualified registered nursing staff and attending physicians retain sole statutory authority
 *    to assign, override, and escalate patient acuity levels.
 */

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

export const TRIAGE_ALGORITHM_METADATA = {
  version: "0.9-preliminary",
  framework: "Emergency Severity Index (ESI) Five-Level Triage",
  clinicalValidationStatus: "Educational / Experimental - Clinician Verification Required",
  unsupportedFeatures: [
    "Autonomous resource utilization calculation (Step C)",
    "Pediatric age-adjusted vital sign zones (< 3 months, 3m-3y, 3-8y)",
    "NIH Stroke Scale / Glasgow Coma Scale integration",
  ],
} as const;

export function computeEsiPriority(v: VitalSigns): number {
  const complaint = (v.chiefComplaint || "").trim().toLowerCase();

  // ── Step A: Level 1 - Immediate life-saving intervention needed? ──
  // Check critical vitals
  if (v.spo2 !== undefined && v.spo2 > 0 && v.spo2 < 85) return 1;
  if (v.heartRate !== undefined && (v.heartRate > 180 || (v.heartRate > 0 && v.heartRate < 40))) return 1;
  if (v.respiratoryRate !== undefined && (v.respiratoryRate > 40 || (v.respiratoryRate > 0 && v.respiratoryRate < 8))) return 1;

  // Immediate life-threat presentations
  if (/(cardiac arrest|unresponsive|cyanosis|apnea|severe hemorrhage|agonal|pulseless|intubated)/i.test(complaint)) {
    return 1;
  }

  // ── Step B: Level 2 - High risk situation, confused/lethargic, severe distress? ──
  // Danger zone physiological criteria
  const dangerHR = v.heartRate !== undefined && v.heartRate > 100;
  const dangerRR = v.respiratoryRate !== undefined && v.respiratoryRate > 20;
  const dangerSpO2 = v.spo2 !== undefined && v.spo2 > 0 && v.spo2 < 92;
  const dangerSystolic = v.systolic !== undefined && (v.systolic > 180 || (v.systolic > 0 && v.systolic < 90));

  if (dangerHR || dangerRR || dangerSpO2 || dangerSystolic) return 2;

  // High-risk presentations (Step B: High-risk situation, potential ACS, severe respiratory distress, acute neuro)
  const highRisk = /chest pain|chest pressure|angina|shortness of breath|sob|dyspnea|stroke|altered mental|seizure|anaphylaxis|syncope|overdose|severe burn|head trauma|poisoning/i;
  if (highRisk.test(complaint)) return 2;

  // ── Step C: Level 3 - Moderate complexity (Expected multiple resources, stable vitals) ──
  const tempNum = typeof v.temperature === "string" ? parseFloat(v.temperature) : v.temperature;
  if (v.heartRate !== undefined && v.heartRate > 90) return 3;
  if (tempNum && tempNum >= 38.5) return 3;
  if (/(abdominal pain|fracture|severe pain|vomiting|dehydration|kidney stone|migraine|cellulitis)/i.test(complaint)) {
    return 3;
  }

  // ── Step D: Level 4 - Less urgent (Single simple resource expected) ──
  if (v.heartRate !== undefined && v.heartRate > 80) return 4;
  if (/(laceration|sprain|rash|earache|urinary pain|mild cough|sore throat|minor burn)/i.test(complaint)) {
    return 4;
  }

  // ── Step E: Level 5 - Non-urgent (No diagnostic resources expected, clinical exam only) ──
  return 5;
}

export const PRIORITY_LABELS: Record<number, { name: string; description: string; badgeClass: string }> = {
  1: {
    name: "Resuscitation (ESI-1)",
    description: "Immediate life-saving intervention required without delay.",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  2: {
    name: "Emergent (ESI-2)",
    description: "High-risk situation, confusional state, or severe physiological distress.",
    badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  3: {
    name: "Urgent (ESI-3)",
    description: "Physiologically stable, anticipated to require multiple diagnostic resources.",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  4: {
    name: "Less Urgent (ESI-4)",
    description: "Stable, anticipated to require a single diagnostic or therapeutic resource.",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  5: {
    name: "Non-Urgent (ESI-5)",
    description: "Routine clinic exam, suture removal, medication refill; zero diagnostic resources.",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
};
