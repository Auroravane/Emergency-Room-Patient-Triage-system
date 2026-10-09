import { createAuth } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { headers } from "next/headers";

export async function getCurrentUser() {
  try {
    const env = await getEnv();
    const auth = createAuth(env);
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    return session?.user ?? null;
  } catch {
    return null;
  }
}
