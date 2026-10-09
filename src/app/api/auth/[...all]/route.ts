import { createAuth } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "edge";

export async function GET(req: Request) {
  const env = await getEnv();
  const auth = createAuth(env);
  return toNextJsHandler(auth).GET(req);
}

export async function POST(req: Request) {
  const env = await getEnv();
  const auth = createAuth(env);
  return toNextJsHandler(auth).POST(req);
}
