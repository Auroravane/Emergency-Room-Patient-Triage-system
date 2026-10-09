import { getDb } from "@/db";
import { patients, vitals } from "@/db/schema";
import { inArray, asc, desc, eq } from "drizzle-orm";

export async function getPatientQueue(env: CloudflareEnv) {
  const db = getDb(env);

  const results = await db
    .select({
      id: patients.id,
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
    .where(inArray(patients.status, ["waiting", "in_treatment"]))
    .orderBy(asc(patients.triagePriority), desc(patients.createdAt))
    .limit(100);

  return results;
}

export async function getPatientDetail(env: CloudflareEnv, patientId: string) {
  const db = getDb(env);

  const patient = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .get();

  if (!patient) return null;

  const patientVitals = await db
    .select()
    .from(vitals)
    .where(eq(vitals.patientId, patientId))
    .all();

  return {
    ...patient,
    vitals: patientVitals,
  };
}
