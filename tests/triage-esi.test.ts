import { describe, it, expect } from "vitest";
import { computeEsiPriority } from "@/lib/triage";

describe("Clinical Triage Heuristic (ESI Acuity Scoring)", () => {
  it("triggers Level 1 (Resuscitation) on critical hypoxia (SpO2 < 85)", () => {
    const priority = computeEsiPriority({
      age: 62,
      chiefComplaint: "General weakness",
      spo2: 82,
      heartRate: 88,
    });
    expect(priority).toBe(1);
  });

  it("triggers Level 1 on extreme bradycardia (< 40 bpm)", () => {
    const priority = computeEsiPriority({
      age: 55,
      chiefComplaint: "Dizziness",
      heartRate: 34,
      spo2: 97,
    });
    expect(priority).toBe(1);
  });

  it("triggers Level 1 on keyword arrest / unresponsive", () => {
    const priority = computeEsiPriority({
      age: 45,
      chiefComplaint: "Unresponsive found down in parking lot",
    });
    expect(priority).toBe(1);
  });

  it("triggers Level 2 (Emergent) on high-risk presentation (chest pain)", () => {
    const priority = computeEsiPriority({
      age: 50,
      chiefComplaint: "Substernal chest pressure radiating to jaw",
      heartRate: 78,
      spo2: 98,
    });
    expect(priority).toBe(2);
  });

  it("triggers Level 2 on danger zone hypertension (systolic > 180)", () => {
    const priority = computeEsiPriority({
      age: 68,
      chiefComplaint: "Mild headache",
      systolic: 195,
      diastolic: 105,
      heartRate: 80,
    });
    expect(priority).toBe(2);
  });

  it("triggers Level 3 (Urgent) on fever (temp >= 38.5C)", () => {
    const priority = computeEsiPriority({
      age: 29,
      chiefComplaint: "Chills and fever",
      temperature: "39.1",
      heartRate: 85,
      spo2: 99,
    });
    expect(priority).toBe(3);
  });

  it("triggers Level 4 (Less Urgent) on simple laceration or sprain", () => {
    const priority = computeEsiPriority({
      age: 22,
      chiefComplaint: "Laceration on right index finger while cutting fruit",
      heartRate: 72,
      spo2: 99,
    });
    expect(priority).toBe(4);
  });

  it("triggers Level 5 (Non-Urgent) on minor complaint with stable vitals", () => {
    const priority = computeEsiPriority({
      age: 38,
      chiefComplaint: "Need routine prescription renewal for blood pressure medication",
      heartRate: 68,
      systolic: 120,
      diastolic: 80,
      spo2: 99,
    });
    expect(priority).toBe(5);
  });
});
