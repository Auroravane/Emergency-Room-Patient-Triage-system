import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Better Auth Core Tables ───────────────────────────────
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["nurse", "doctor", "admin"] }).notNull().default("nurse"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// ─── Clinical Tables ────────────────────────────────────────
export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender", { enum: ["male", "female", "other"] }).notNull(),
  chiefComplaint: text("chief_complaint").notNull(),
  clinicalNote: text("clinical_note"),
  triagePriority: integer("triage_priority").notNull(), // 1–5 (ESI)
  autoPriority: integer("auto_priority").notNull(),
  status: text("status", {
    enum: ["waiting", "in_treatment", "admitted", "discharged"],
  }).notNull().default("waiting"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  index("idx_patients_priority").on(table.triagePriority),
  index("idx_patients_status").on(table.status),
  index("idx_patients_created").on(table.createdAt),
]);

export const vitals = sqliteTable("vitals", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  heartRate: integer("heart_rate"),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  temperature: text("temperature"),
  respiratoryRate: integer("respiratory_rate"),
  spo2: integer("spo2"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  patientId: text("patient_id").references(() => patients.id),
  action: text("action").notNull(),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  index("idx_audit_user").on(table.userId),
  index("idx_audit_patient").on(table.patientId),
  index("idx_audit_action").on(table.action),
]);
