import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv(): Promise<CloudflareEnv> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env) {
      return ctx.env as CloudflareEnv;
    }
  } catch {
    // Fallback if not inside OpenNext request context
  }

  // Check globalThis (wrangler preview or worker global environment)
  const g = globalThis as unknown as { env?: CloudflareEnv; DB?: unknown; [key: string]: unknown };
  if (g.env) {
    return g.env;
  }
  if (g.DB) {
    return g as unknown as CloudflareEnv;
  }

  // Environment fallback
  return {
    DB: process.env.DB as unknown as CloudflareEnv["DB"],
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "development-secret-er-triage-key-at-least-32-chars",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || process.env.APP_URL || "http://localhost:3000",
    APP_URL: process.env.APP_URL || "http://localhost:3000",
  } as CloudflareEnv;
}
