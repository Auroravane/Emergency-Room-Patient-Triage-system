import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv(): Promise<CloudflareEnv> {
  // 1. Try OpenNext context (primary for Server Components, Server Actions & Route Handlers)
  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DB) {
      return ctx.env as CloudflareEnv;
    }
  } catch {
    // Ignore and fallback
  }

  // 2. Check globalThis (Cloudflare Worker global scope)
  const g = globalThis as unknown as { env?: CloudflareEnv; DB?: D1Database; [key: string]: unknown };
  if (g.env?.DB) {
    return g.env;
  }
  if (g.DB) {
    return g as unknown as CloudflareEnv;
  }

  // 3. Fallback to process.env (local node / test environments)
  const p = process.env as unknown as {
    DB?: D1Database;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    APP_URL?: string;
  };

  return {
    DB: p.DB,
    BETTER_AUTH_SECRET: p.BETTER_AUTH_SECRET || "development-secret-er-triage-key-at-least-32-chars",
    BETTER_AUTH_URL:
      p.BETTER_AUTH_URL ||
      p.APP_URL ||
      "https://emergency-room-patient-triage-system.auroravane-official.workers.dev",
    APP_URL:
      p.APP_URL ||
      p.BETTER_AUTH_URL ||
      "https://emergency-room-patient-triage-system.auroravane-official.workers.dev",
  } as CloudflareEnv;
}
