# Northstar ER Patient Triage

Cloudflare Workers emergency-room triage dashboard built with Next.js App Router, OpenNext, D1, Drizzle, Zod, and Tailwind.

## Setup

1. Install dependencies with `npm install`.
2. Create a D1 database: `npx wrangler d1 create triage-db`, then place the returned ID in `wrangler.toml`.
3. Apply the schema locally with `npm run db:migrate:local` or remotely with `npm run db:migrate:remote`.
4. Set `BETTER_AUTH_SECRET` using `npx wrangler secret put BETTER_AUTH_SECRET` and update `APP_URL`.
5. Run `npm run dev`, then deploy with `npm run deploy`.

The queue is ordered by priority then arrival time and polls every seven seconds. Triage priority is automatically calculated from vitals and complaint keywords; nurses can override it during intake. The current starter includes the D1-backed intake and status workflow. Wire Better Auth session middleware to your chosen staff login page before production use.
# Emergency-Room-Patient-Triage-system
