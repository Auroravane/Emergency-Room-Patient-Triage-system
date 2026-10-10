-- Phase Five: Multi-Tenant Facility Isolation Migration
-- 1. Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

-- 2. Create facility_members table
CREATE TABLE IF NOT EXISTS facility_members (
  id text PRIMARY KEY NOT NULL,
  facility_id text NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  role text DEFAULT 'nurse' NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_member_facility ON facility_members(facility_id);
CREATE INDEX IF NOT EXISTS idx_member_user ON facility_members(user_id);

-- 3. Seed canonical default primary facility if not exists so existing records remain intact
INSERT OR IGNORE INTO facilities (id, name, slug)
VALUES ('facility-northstar-main', 'NorthStar Emergency Department - Main Campus', 'northstar-main');

-- 4. In SQLite, ALTER TABLE ADD COLUMN with REFERENCES cannot have non-null default without FK pragma or without plain column.
-- We add the column as text with default 'facility-northstar-main', and create the index.
ALTER TABLE patients ADD COLUMN facility_id text NOT NULL DEFAULT 'facility-northstar-main';
ALTER TABLE vitals ADD COLUMN facility_id text NOT NULL DEFAULT 'facility-northstar-main';
ALTER TABLE audit_log ADD COLUMN facility_id text NOT NULL DEFAULT 'facility-northstar-main';

-- 5. Add indexes for high-frequency scoped tenant queries
CREATE INDEX IF NOT EXISTS idx_patients_facility ON patients(facility_id);
CREATE INDEX IF NOT EXISTS idx_vitals_facility ON vitals(facility_id);
CREATE INDEX IF NOT EXISTS idx_audit_facility ON audit_log(facility_id);
