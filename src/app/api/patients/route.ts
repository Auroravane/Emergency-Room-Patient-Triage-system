import { getPatientQueue } from "@/modules/patients/queries";
import { getEnv } from "@/lib/env";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const env = await getEnv();
    const queue = await getPatientQueue(env);
    return NextResponse.json({ ok: true, count: queue.length, queue });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching patient queue";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
