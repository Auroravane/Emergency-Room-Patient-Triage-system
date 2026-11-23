# Northstar ER Patient Triage

A full-stack emergency-room patient triage application for patient intake, priority assignment, clinical status tracking, and facility-scoped operations.

Built with Next.js, React, TypeScript, Cloudflare Workers, and Cloudflare D1, the system is designed around role-based access, tenant isolation, and a five-level ESI-style triage heuristic.

> **Clinical safety notice:** This project is an educational and engineering prototype. Its triage algorithm has not been certified or independently validated as an autonomous medical device or diagnostic system. Qualified clinical staff must verify and, when necessary, override every triage assignment. Do not rely on this software for real-world emergency medical decisions.

## Key Features

- **Patient intake** — capture demographics, chief complaint, symptoms, and vital signs
- **ESI-style prioritization** — suggest a priority from 1 (resuscitation) through 5 (non-urgent)
- **Clinical override** — allow authorized staff to adjust calculated priority
- **Patient queue** — view and manage patients in a facility-scoped dashboard
- **Status workflow** — move patients through waiting, treatment, admission, and discharge states
- **Role-based access control** — separate capabilities for nurses, doctors, and administrators
- **Multi-facility isolation** — restrict records and operations to the user's assigned facility
- **Audit-focused design** — protect status transitions and sensitive operations with permission checks
- **Cloudflare deployment** — run the application on Workers with a D1 database

## Priority Levels

| Level | Name | Typical interpretation |
|---:|---|---|
| 1 | Resuscitation | Immediate life-saving intervention required |
| 2 | Emergent | High-risk or severe physiological distress |
| 3 | Urgent | Stable but likely to require multiple resources |
| 4 | Less urgent | Likely to require one resource |
| 5 | Non-urgent | Routine examination or minor issue |

The supplied heuristic is preliminary and uses critical vitals, chief complaints, heart rate, respiratory rate, oxygen saturation, blood pressure, and temperature. It does not implement every requirement of formal ESI-v5 and is not sufficient for clinical use without professional judgment.

## Tech Stack

- **Framework:** Next.js 15 with the App Router
- **UI:** React 19 and TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth
- **Database:** Cloudflare D1
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Testing:** Vitest
- **Deployment:** OpenNext for Cloudflare Workers
- **Runtime:** Node.js 22

## Project Structure

```text
.
├── src/
│   ├── app/              # Pages, layouts, API routes, and dashboard UI
│   ├── components/       # Reusable React components
│   ├── db/               # Database schema and seed data
│   ├── lib/              # Authentication, authorization, environment, and triage logic
│   ├── modules/          # Patient queries and server actions
│   ├── middleware.ts     # Request-level route protection
│   └── types/            # Shared TypeScript types
├── drizzle/              # D1 migrations and seed SQL
├── scripts/              # Database seeding utilities
├── tests/                # Vitest security and triage tests
├── wrangler.jsonc        # Cloudflare Worker and D1 configuration
└── package.json          # Scripts and dependencies
```

## Prerequisites

- Node.js 22
- npm
- A Cloudflare account for remote D1 deployment
- Wrangler CLI, available through the project dependencies

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Auroravane/Emergency-Room-Patient-Triage-system.git
   cd Emergency-Room-Patient-Triage-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the D1 bindings and application variables into your local Wrangler environment if needed. The repository configuration includes:

   - `DB` — Cloudflare D1 binding
   - `BETTER_AUTH_URL` — authentication base URL
   - `APP_URL` — application base URL

4. Apply database migrations locally:

   ```bash
   npm run db:migrate:local
   ```

5. Start the Next.js development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Database Operations

Generate migration files after changing the Drizzle schema:

```bash
npm run db:generate
```

Apply migrations to a local D1 database:

```bash
npm run db:migrate:local
```

Apply migrations to the configured remote D1 database:

```bash
npm run db:migrate:remote
```

Run the seed utility:

```bash
npm run db:seed
```

Seed SQL is also available in `drizzle/seed.sql`.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production Next.js build |
| `npm run preview` | Build and preview through OpenNext on Cloudflare |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate:local` | Apply migrations to local D1 |
| `npm run db:migrate:remote` | Apply migrations to remote D1 |
| `npm run db:seed` | Seed the database |
| `npm run cf-typegen` | Generate Cloudflare environment types |
| `npm run lint` | Run Next.js linting |
| `npm test` | Run the Vitest suite |

## Testing

Run all tests with:

```bash
npm test
```

The test suite covers:

- Authentication and exposed-route behavior
- Environment-variable hardening
- Role-based permissions and status transitions
- Facility and tenant isolation
- ESI triage priority classification

## Roles and Permissions

| Role | Primary capabilities |
|---|---|
| Nurse | Read and create patient records; assign or override triage; read facility data |
| Doctor | Read and update patient records; update and read clinical status; read triage and audits |
| Admin | Manage patients, triage, status, facilities, users, and audit records |

These are application-level permissions. Production deployments should also enforce authentication, session validity, server-side authorization, and facility scoping at every data boundary.

## Deployment

The Worker is configured in `wrangler.jsonc`:

- Worker entry: `.open-next/worker.js`
- Static assets: `.open-next/assets`
- D1 binding: `DB`
- D1 database: `er-triage-db`
- Migration directory: `drizzle`
- Node.js compatibility: enabled

Before deploying:

1. Authenticate Wrangler:

   ```bash
   npx wrangler login
   ```

2. Confirm or update the D1 database ID and application URLs in `wrangler.jsonc`.

3. Apply remote migrations:

   ```bash
   npm run db:migrate:remote
   ```

4. Deploy:

   ```bash
   npm run deploy
   ```

Keep secrets such as authentication keys and provider credentials in Wrangler secrets or Cloudflare environment bindings rather than source control.

## Clinical and Security Considerations

- The triage heuristic is preliminary and should not make autonomous clinical decisions.
- Formal ESI resource estimation, pediatric age adjustments, stroke scales, and Glasgow Coma Scale integration are not fully implemented.
- Never enter real patient-identifiable data in a prototype or development environment without appropriate authorization and safeguards.
- Review authentication, audit logging, database access, and facility isolation before any production clinical deployment.
- Obtain applicable legal, privacy, clinical-safety, and regulatory approval before use in a healthcare setting.

## Contributing

1. Create a feature branch from `main`.
2. Keep changes typed and scoped to a single feature or fix.
3. Add or update Vitest coverage for triage, permission, status, tenant, and security behavior.
4. Run `npm test`, `npm run lint`, and `npm run build` before opening a pull request.

## License

No license is currently declared in this repository. All rights are reserved by the repository owner unless a license is added.
