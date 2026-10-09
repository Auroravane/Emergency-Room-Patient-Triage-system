"use server";

import { createAuth } from "@/lib/auth";
import { getDb } from "@/db";
import { getEnv } from "@/lib/env";
import { patients, vitals, auditLog } from "@/db/schema";
import { computeEsiPriority } from "@/lib/triage";
import { hasPermission } from "@/lib/permissions";
import { eq } from "drizzle-orm";
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

    // RBAC: nurses and admins can triage
    const userRole = (session?.user as { role?: string } | undefined)?.role || "nurse";
    if (!session || !hasPermission(userRole, "patient", "create")) {
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
    const finalPriority = data.manualPriority || autoPriority;
    const patientId = crypto.randomUUID();
    const vitalsId = crypto.randomUUID();
    const auditId = crypto.randomUUID();
    const db = getDb(env);

    await db.batch([
      db.insert(patients).values({
        id: patientId,
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
        userId: session.user.id,
        patientId,
        action: isOverridden ? "priority_override" : "triage_created",
        metadata: JSON.stringify({
          autoPriority,
          finalPriority,
          isOverridden,
          overrideReason: data.overrideReason || null,
          staffName: session.user.name,
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

    const userRole = (session?.user as { role?: string } | undefined)?.role || "doctor";
    if (!session || !hasPermission(userRole, "status", "update")) {
      return { ok: false, error: "Unauthorized: Only doctors or admins may change patient status." };
    }

    const validStatuses = ["waiting", "in_treatment", "admitted", "discharged"] as const;
    if (!validStatuses.includes(newStatus as (typeof validStatuses)[number])) {
      return { ok: false, error: "Invalid clinical status transition" };
    }

    const db = getDb(env);

    await db.batch([
      db
        .update(patients)
        .set({
          status: newStatus as (typeof validStatuses)[number],
          updatedAt: new Date(),
        })
        .where(eq(patients.id, patientId)),
      db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        patientId,
        action: "status_changed",
        metadata: JSON.stringify({
          to: newStatus,
          reason: reason || "Routine treatment progression",
          staff: session.user.name,
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

    const userRole = (session?.user as { role?: string } | undefined)?.role || "nurse";
    if (!session || !hasPermission(userRole, "triage", "override")) {
      return { ok: false, error: "Unauthorized: Nurse or admin role required for priority override." };
    }

    if (!reason || reason.trim().length < 3) {
      return { ok: false, error: "A valid clinical reason is required for priority override." };
    }

    const db = getDb(env);
    await db.batch([
      db
        .update(patients)
        .set({ triagePriority: newPriority, updatedAt: new Date() })
        .where(eq(patients.id, patientId)),
      db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        patientId,
        action: "priority_override",
        metadata: JSON.stringify({
          to: newPriority,
          reason,
          staff: session.user.name,
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
