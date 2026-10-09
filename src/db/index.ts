import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(env: CloudflareEnv) {
  if (!env || !env.DB) {
    throw new Error("D1 Database binding (env.DB) is not available.");
  }
  return drizzle(env.DB, { schema });
}
