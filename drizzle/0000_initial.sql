PRAGMA defer_foreign_keys = on;

CREATE TABLE IF NOT EXISTS user (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified integer DEFAULT 0 NOT NULL,
  image text,
  role text DEFAULT 'nurse' NOT NULL,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at integer NOT NULL,
  ip_address text,
  user_agent text,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  password text,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY NOT NULL,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at integer NOT NULL,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  chief_complaint text NOT NULL,
  clinical_note text,
  triage_priority integer NOT NULL,
  auto_priority integer NOT NULL,
  status text DEFAULT 'waiting' NOT NULL,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS vitals (
  id text PRIMARY KEY NOT NULL,
  patient_id text NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  temperature text,
  respiratory_rate integer,
  spo2 integer,
  recorded_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES user(id),
  patient_id text REFERENCES patients(id),
  action text NOT NULL,
  metadata text,
  created_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(triage_priority);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_patient ON audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
