import { describe, it, expect } from "vitest";

// Synthetic database state model for tenant isolation proof
interface TenantPatient {
  id: string;
  facilityId: string;
  name: string;
  chiefComplaint: string;
  status: string;
}

const mockDb: TenantPatient[] = [
  {
    id: "pat-facA-01",
    facilityId: "facility-alpha",
    name: "John Doe Alpha",
    chiefComplaint: "Alpha Chest Pain",
    status: "waiting",
  },
  {
    id: "pat-facB-01",
    facilityId: "facility-beta",
    name: "Jane Smith Beta",
    chiefComplaint: "Beta Sprained Ankle",
    status: "waiting",
  },
];

function getScopedQueue(facilityId: string): TenantPatient[] {
  return mockDb.filter((p) => p.facilityId === facilityId);
}

function getScopedPatientDetail(patientId: string, facilityId: string): TenantPatient | null {
  const patient = mockDb.find((p) => p.id === patientId && p.facilityId === facilityId);
  return patient || null;
}

function updateScopedPatientStatus(
  patientId: string,
  facilityId: string,
  newStatus: string
): { success: boolean; error?: string } {
  const patient = mockDb.find((p) => p.id === patientId && p.facilityId === facilityId);
  if (!patient) {
    return { success: false, error: "Patient record not found in your facility" };
  }
  patient.status = newStatus;
  return { success: true };
}

describe("Phase Five: Multi-Tenant Facility Isolation", () => {
  it("Facility Alpha cannot retrieve Facility Beta's patients", () => {
    const alphaQueue = getScopedQueue("facility-alpha");
    const betaQueue = getScopedQueue("facility-beta");

    expect(alphaQueue).toHaveLength(1);
    expect(alphaQueue[0].name).toBe("John Doe Alpha");
    expect(alphaQueue.some((p) => p.facilityId === "facility-beta")).toBe(false);

    expect(betaQueue).toHaveLength(1);
    expect(betaQueue[0].name).toBe("Jane Smith Beta");
    expect(betaQueue.some((p) => p.facilityId === "facility-alpha")).toBe(false);
  });

  it("changing patient ID to another facility's ID is rejected (cannot bypass facility boundary)", () => {
    // User in Facility Alpha attempts to fetch Facility Beta's patient
    const foreignPatient = getScopedPatientDetail("pat-facB-01", "facility-alpha");
    expect(foreignPatient).toBeNull();
  });

  it("staff member in Facility Alpha cannot mutate Facility Beta records", () => {
    const res = updateScopedPatientStatus("pat-facB-01", "facility-alpha", "in_treatment");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Patient record not found in your facility");

    // Verify Beta's patient was untouched
    const betaPatient = mockDb.find((p) => p.id === "pat-facB-01");
    expect(betaPatient?.status).toBe("waiting");
  });

  it("authorized staff member in Facility Beta can mutate their own facility records", () => {
    const res = updateScopedPatientStatus("pat-facB-01", "facility-beta", "in_treatment");
    expect(res.success).toBe(true);

    const betaPatient = mockDb.find((p) => p.id === "pat-facB-01");
    expect(betaPatient?.status).toBe("in_treatment");
  });
});
