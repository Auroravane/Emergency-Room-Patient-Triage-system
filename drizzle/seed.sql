INSERT OR IGNORE INTO user (id, name, email, email_verified, role, created_at, updated_at) VALUES 
('nurse-sarah', 'Nurse Sarah Jenkins, RN', 'nurse.sarah@hospital.er', 1, 'nurse', unixepoch(), unixepoch()),
('doctor-chen', 'Dr. Alexander Chen, MD', 'doctor.chen@hospital.er', 1, 'doctor', unixepoch(), unixepoch()),
('admin-cmo', 'Chief Medical Officer', 'cmo.admin@hospital.er', 1, 'admin', unixepoch(), unixepoch());

-- Seed initial test patient records (ESI-1, ESI-2, ESI-3, ESI-4)
INSERT OR IGNORE INTO patients (id, name, age, gender, chief_complaint, clinical_note, triage_priority, auto_priority, status, created_at, updated_at) VALUES
('pt-01', 'Arthur Pendelton', 64, 'male', 'Crushing retrosternal chest pain radiating to left jaw, diaphoresis', 'Pale, cold clammy skin. Immediate ECG ordered.', 1, 1, 'waiting', unixepoch() - 600, unixepoch() - 600),
('pt-02', 'Marcus Vance', 24, 'male', 'Stridor, severe acute respiratory distress following peanut ingestion', 'Known anaphylaxis history. IM Epinephrine administered.', 2, 2, 'waiting', unixepoch() - 420, unixepoch() - 420),
('pt-03', 'Elena Rostova', 41, 'female', 'Right lower quadrant abdominal pain, rebound tenderness, fever 39.1C', 'Suspected acute appendicitis. NPO started.', 3, 3, 'waiting', unixepoch() - 300, unixepoch() - 300),
('pt-04', 'Liam O''Connor', 19, 'male', 'Deep forearm laceration from broken bottle glass', 'Pressure dressing applied. Requires suture exploration.', 4, 4, 'in_treatment', unixepoch() - 180, unixepoch() - 180);

INSERT OR IGNORE INTO vitals (id, patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, spo2, recorded_at) VALUES
('vt-01', 'pt-01', 118, 185, 105, '36.8', 26, 88, unixepoch() - 600),
('vt-02', 'pt-02', 135, 92, 58, '37.1', 34, 84, unixepoch() - 420),
('vt-03', 'pt-03', 96, 122, 78, '39.1', 18, 98, unixepoch() - 300),
('vt-04', 'pt-04', 82, 120, 80, '36.6', 16, 99, unixepoch() - 180);
