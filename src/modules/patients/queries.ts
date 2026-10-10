import { getDb } from "@/db";
import { patients, vitals } from "@/db/schema";
import { inArray, asc, desc, eq, and } from "drizzle-orm";

export async function getPatientQueue(env: CloudflareEnv, facilityId: string) {
  const db = getDb(env);

  const results = await db
    .select({
      id: patients.id,
      facilityId: patients.facilityId,
      name: patients.name,
      age: patients.age,
      gender: patients.gender,
      chiefComplaint: patients.chiefComplaint,
      clinicalNote: patients.clinicalNote,
      triagePriority: patients.triagePriority,
      autoPriority: patients.autoPriority,
      status: patients.status,
      createdAt: patients.createdAt,
      heartRate: vitals.heartRate,
      systolic: vitals.bloodPressureSystolic,
      diastolic: vitals.bloodPressureDiastolic,
      temperature: vitals.temperature,
      respiratoryRate: vitals.respiratoryRate,
      spo2: vitals.spo2,
    })
    .from(patients)
    .leftJoin(vitals, eq(vitals.patientId, patients.id))
    .where(
      and(
        eq(patients.facilityId, facilityId),
        inArray(patients.status, ["waiting", "in_treatment"])
      )
    )
    .orderBy(asc(patients.triagePriority), desc(patients.createdAt))
    .limit(100);

  return results;
}

export async function getPatientDetail(env: CloudflareEnv, patientId: string, facilityId: string) {
  const db = getDb(env);

  const patient = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.facilityId, facilityId)))
    .get();

  if (!patient) return null;

  const patientVitals = await db
    .select()
    .from(vitals)
    .where(and(eq(vitals.patientId, patientId), eq(vitals.facilityId, facilityId)))
    .all();

  return {
    ...patient,
    vitals: patientVitals,
  };
}
