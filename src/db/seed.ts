import { getDb } from "@/db";
import { user, account, patients, vitals } from "@/db/schema";
import { getEnv } from "@/lib/env";
import { computeEsiPriority } from "@/lib/triage";

export async function seedDatabase(env: CloudflareEnv) {
  const db = getDb(env);

  console.log("Seeding clinical staff accounts...");
  const nurseId = "nurse-sarah-id";
  const doctorId = "doctor-chen-id";
  const adminId = "admin-director-id";

  // Upsert Users
  await db
    .insert(user)
    .values([
      {
        id: nurseId,
        name: "Nurse Sarah Jenkins, RN",
        email: "nurse.sarah@hospital.er",
        emailVerified: true,
        role: "nurse",
      },
      {
        id: doctorId,
        name: "Dr. Alexander Chen, MD",
        email: "doctor.chen@hospital.er",
        emailVerified: true,
        role: "doctor",
      },
      {
        id: adminId,
        name: "Chief Medical Officer",
        email: "cmo.admin@hospital.er",
        emailVerified: true,
        role: "admin",
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding sample emergency patients...");
  const samplePatients = [
    {
      id: "pt-101",
      name: "Arthur Pendelton",
      age: 62,
      gender: "male" as const,
      chiefComplaint: "Crushing substernal chest pain radiating to left jaw, diaphoresis",
      heartRate: 115,
      systolic: 185,
      diastolic: 105,
      temperature: "36.8",
      respiratoryRate: 26,
      spo2: 89,
      status: "waiting" as const,
    },
    {
      id: "pt-102",
      name: "Marcus Vance",
      age: 24,
      gender: "male" as const,
      chiefComplaint: "Stridor, acute respiratory distress, severe peanut exposure",
      heartRate: 135,
      systolic: 95,
      diastolic: 60,
      temperature: "37.2",
      respiratoryRate: 34,
      spo2: 84,
      status: "waiting" as const,
    },
    {
      id: "pt-103",
      name: "Elena Rostova",
      age: 41,
      gender: "female" as const,
      chiefComplaint: "Right lower quadrant abdominal pain, vomiting, fever 39.1C",
      heartRate: 98,
      systolic: 122,
      diastolic: 78,
      temperature: "39.1",
      respiratoryRate: 18,
      spo2: 98,
      status: "waiting" as const,
    },
    {
      id: "pt-104",
      name: "Liam O'Connor",
      age: 19,
      gender: "male" as const,
      chiefComplaint: "Right forearm laceration from broken glass, active bleeding controlled with pressure",
      heartRate: 82,
      systolic: 120,
      diastolic: 80,
      temperature: "36.6",
      respiratoryRate: 16,
      spo2: 99,
      status: "in_treatment" as const,
    },
  ];

  for (const pt of samplePatients) {
    const priority = computeEsiPriority(pt);
    await db
      .insert(patients)
      .values({
        id: pt.id,
        name: pt.name,
        age: pt.age,
        gender: pt.gender,
        chiefComplaint: pt.chiefComplaint,
        triagePriority: priority,
        autoPriority: priority,
        status: pt.status,
      })
      .onConflictDoNothing();

    await db
      .insert(vitals)
      .values({
        id: `vt-${pt.id}`,
        patientId: pt.id,
        heartRate: pt.heartRate,
        bloodPressureSystolic: pt.systolic,
        bloodPressureDiastolic: pt.diastolic,
        temperature: pt.temperature,
        respiratoryRate: pt.respiratoryRate,
        spo2: pt.spo2,
      })
      .onConflictDoNothing();
  }

  console.log("Database seeded successfully.");
}
