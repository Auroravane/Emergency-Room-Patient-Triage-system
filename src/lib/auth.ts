import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

export function createAuth(env: CloudflareEnv) {
  const db = getDb(env);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: env.BETTER_AUTH_SECRET || "development-secret-er-triage-key-at-least-32-chars",
    baseURL: env.BETTER_AUTH_URL || env.APP_URL || "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24,     // refresh daily
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "nurse",
        },
      },
    },
  });
}
