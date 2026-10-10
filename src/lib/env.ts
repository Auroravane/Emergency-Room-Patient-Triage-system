import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv(): Promise<CloudflareEnv> {
  // 1. Try OpenNext context (primary for Server Components, Server Actions & Route Handlers)
  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DB) {
      return validateEnv(ctx.env as CloudflareEnv);
    }
  } catch {
    // Ignore and fallback
  }

  // 2. Check globalThis (Cloudflare Worker global scope)
  const g = globalThis as unknown as { env?: CloudflareEnv; DB?: D1Database; [key: string]: unknown };
  if (g.env?.DB) {
    return validateEnv(g.env);
  }
  if (g.DB) {
    return validateEnv(g as unknown as CloudflareEnv);
  }

  // 3. Fallback to process.env (local node / test environments)
  const p = process.env as unknown as {
    DB?: D1Database;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    APP_URL?: string;
    NODE_ENV?: string;
  };

  const isDevOrTest = !p.NODE_ENV || p.NODE_ENV === "development" || p.NODE_ENV === "test";

  let secret = p.BETTER_AUTH_SECRET;
  if (!secret) {
    if (isDevOrTest) {
      secret = "development-secret-er-triage-key-at-least-32-chars";
    } else {
      throw new Error("FATAL: BETTER_AUTH_SECRET is not configured in production environment. Refusing to run in insecure state.");
    }
  }

  return {
    DB: p.DB,
    BETTER_AUTH_SECRET: secret,
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

function validateEnv(env: CloudflareEnv): CloudflareEnv {
  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  if (!env.BETTER_AUTH_SECRET) {
    if (!isDev) {
      throw new Error("FATAL: Cloudflare secret BETTER_AUTH_SECRET is missing. Insecure execution prevented.");
    }
    // Local dev fallback
    env.BETTER_AUTH_SECRET = "development-secret-er-triage-key-at-least-32-chars";
  }
  return env;
}
