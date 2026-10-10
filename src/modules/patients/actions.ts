"use server";

import { createAuth } from "@/lib/auth";
import { getDb } from "@/db";
import { getEnv } from "@/lib/env";
import { patients, vitals, auditLog } from "@/db/schema";
import { computeEsiPriority } from "@/lib/triage";
import { hasPermission, isValidStatusTransition } from "@/lib/permissions";
import { resolveUserFacility } from "@/lib/facility";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const TriageFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.enum(["male", "female", "other"]),
  chiefComplaint: z.string().min(2, "Chief complaint is required").max(2000),
  clinicalNote: z.string().optional(),
  heartRate: z.coerce.number().int().min(1).max(300).optional(),
  systolic: z.coerce.number().int().min(1).max(300).optional(),
  diastolic: z.coerce.number().int().min(1).max(200).optional(),
  temperature: z.string().optional(),
  respiratoryRate: z.coerce.number().int().min(1).max(100).optional(),
  spo2: z.coerce.number().int().min(1).max(100).optional(),
  manualPriority: z.coerce.number().int().min(1).max(5).optional(),
  overrideReason: z.string().optional(),
});

export async function createTriage(formData: FormData) {
  try {
    const env = await getEnv();
    const auth = createAuth(env);
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session || !session.user) {
      return { ok: false, error: "Unauthorized: Unauthenticated user session." };
    }

    const facilityCtx = await resolveUserFacility(env, session.user.id);
    if (!facilityCtx) {
      return { ok: false, error: "Unauthorized: No active facility authorization found." };
    }

    // RBAC: nurses and admins can intake
    if (!hasPermission(facilityCtx.role, "patient", "create")) {
      return { ok: false, error: "Unauthorized: Only clinical nursing staff or admins may intake patients." };
    }

    const rawData = Object.fromEntries(formData);
    const parsed = TriageFormSchema.safeParse(rawData);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Validation failed";
      return { ok: false, error: issue };
    }

    const data = parsed.data;
    const autoPriority = computeEsiPriority({
      age: data.age,
      chiefComplaint: data.chiefComplaint,
      heartRate: data.heartRate,
      systolic: data.systolic,
      diastolic: data.diastolic,
      temperature: data.temperature,
      respiratoryRate: data.respiratoryRate,
      spo2: data.spo2,
    });

    const isOverridden = !!data.manualPriority && data.manualPriority !== autoPriority;
    if (isOverridden && (!data.overrideReason || data.overrideReason.trim().length < 3)) {
      return { ok: false, error: "A clinical reason is mandatory when manually overriding ESI acuity." };
    }

    const finalPriority = data.manualPriority || autoPriority;
    const patientId = crypto.randomUUID();
    const vitalsId = crypto.randomUUID();
    const auditId = crypto.randomUUID();
    const db = getDb(env);

    // Atomic write in db.batch()
    await db.batch([
      db.insert(patients).values({
        id: patientId,
        facilityId: facilityCtx.facilityId,
        name: data.name,
        age: data.age,
        gender: data.gender,
        chiefComplaint: data.chiefComplaint,
        clinicalNote: data.clinicalNote || null,
        triagePriority: finalPriority,
        autoPriority: autoPriority,
        status: "waiting",
      }),
      db.insert(vitals).values({
        id: vitalsId,
        facilityId: facilityCtx.facilityId,
        patientId,
        heartRate: data.heartRate ?? null,
        bloodPressureSystolic: data.systolic ?? null,
        bloodPressureDiastolic: data.diastolic ?? null,
        temperature: data.temperature || null,
        respiratoryRate: data.respiratoryRate ?? null,
        spo2: data.spo2 ?? null,
      }),
      db.insert(auditLog).values({
        id: auditId,
        facilityId: facilityCtx.facilityId,
        userId: session.user.id,
        patientId,
        action: isOverridden ? "priority_override" : "triage_created",
        metadata: JSON.stringify({
          autoPriority,
          finalPriority,
          isOverridden,
          overrideReason: data.overrideReason || null,
          staffRole: facilityCtx.role,
        }),
      }),
    ]);

    revalidatePath("/dashboard");
    return { ok: true, patientId, priority: finalPriority, autoPriority };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating patient intake";
    return { ok: false, error: msg };
  }
}

export async function updatePatientStatus(patientId: string, newStatus: string, reason?: string) {
  try {
    const env = await getEnv();
    const auth = createAuth(env);
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session || !session.user) {
      return { ok: false, error: "Unauthorized: Unauthenticated user session." };
    }

    const facilityCtx = await resolveUserFacility(env, session.user.id);
    if (!facilityCtx) {
      return { ok: false, error: "Unauthorized: No active facility context." };
    }

    if (!hasPermission(facilityCtx.role, "status", "update")) {
      return { ok: false, error: "Unauthorized: Only doctors or admins may change clinical patient status." };
    }

    const validStatuses = ["waiting", "in_treatment", "admitted", "discharged"] as const;
    if (!validStatuses.includes(newStatus as (typeof validStatuses)[number])) {
      return { ok: false, error: "Invalid clinical status transition requested." };
    }

    const db = getDb(env);

    // Fetch existing patient strictly scoped by facilityId
    const existingPatient = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.facilityId, facilityCtx.facilityId)))
      .get();

    if (!existingPatient) {
      return { ok: false, error: "Patient record not found in your facility." };
    }

    // Validate state machine progression
    if (!isValidStatusTransition(existingPatient.status, newStatus)) {
      return {
        ok: false,
        error: `Illegal clinical status transition: cannot transition from '${existingPatient.status}' to '${newStatus}'.`,
      };
    }

    await db.batch([
      db
        .update(patients)
        .set({
          status: newStatus as (typeof validStatuses)[number],
          updatedAt: new Date(),
        })
        .where(and(eq(patients.id, patientId), eq(patients.facilityId, facilityCtx.facilityId))),
      db.insert(auditLog).values({
        id: crypto.randomUUID(),
        facilityId: facilityCtx.facilityId,
        userId: session.user.id,
        patientId,
        action: "status_changed",
        metadata: JSON.stringify({
          from: existingPatient.status,
          to: newStatus,
          reason: reason || "Routine treatment progression",
          staffRole: facilityCtx.role,
        }),
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${patientId}`);
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating patient status";
    return { ok: false, error: msg };
  }
}

export async function overridePriority(patientId: string, newPriority: number, reason: string) {
  try {
    const env = await getEnv();
    const auth = createAuth(env);
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session || !session.user) {
      return { ok: false, error: "Unauthorized: Unauthenticated user session." };
    }

    const facilityCtx = await resolveUserFacility(env, session.user.id);
    if (!facilityCtx) {
      return { ok: false, error: "Unauthorized: No active facility context." };
    }

    if (!hasPermission(facilityCtx.role, "triage", "override")) {
      return { ok: false, error: "Unauthorized: Nurse or admin role required for priority override." };
    }

    if (!reason || reason.trim().length < 3) {
      return { ok: false, error: "A valid clinical reason is required for priority override." };
    }

    if (newPriority < 1 || newPriority > 5) {
      return { ok: false, error: "Priority must be between 1 and 5." };
    }

    const db = getDb(env);

    // Verify patient belongs to facility
    const existing = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.facilityId, facilityCtx.facilityId)))
      .get();

    if (!existing) {
      return { ok: false, error: "Patient record not found in your facility." };
    }

    await db.batch([
      db
        .update(patients)
        .set({ triagePriority: newPriority, updatedAt: new Date() })
        .where(and(eq(patients.id, patientId), eq(patients.facilityId, facilityCtx.facilityId))),
      db.insert(auditLog).values({
        id: crypto.randomUUID(),
        facilityId: facilityCtx.facilityId,
        userId: session.user.id,
        patientId,
        action: "priority_override",
        metadata: JSON.stringify({
          from: existing.triagePriority,
          to: newPriority,
          reason,
          staffRole: facilityCtx.role,
        }),
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${patientId}`);
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error overriding priority";
    return { ok: false, error: msg };
  }
}
