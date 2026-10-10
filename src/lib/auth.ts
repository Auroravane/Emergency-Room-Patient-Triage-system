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
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || env.APP_URL || "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24,     // refresh daily
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 min cache
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "nurse",
          input: false, // CRITICAL: Prevent client from supplying or overriding role during public sign-up
        },
      },
    },
  });
}
