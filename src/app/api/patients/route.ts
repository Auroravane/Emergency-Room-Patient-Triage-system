import { getPatientQueue } from "@/modules/patients/queries";
import { getEnv } from "@/lib/env";
import { createAuth } from "@/lib/auth";
import { resolveUserFacility } from "@/lib/facility";
import { hasPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const env = await getEnv();
    const auth = createAuth(env);

    // 1. Better Auth session validation
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Valid authentication session required." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // 2. Resolve trusted facility context & role on the server
    const facilityCtx = await resolveUserFacility(env, session.user.id);
    if (!facilityCtx) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: No active facility membership found for account." },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // 3. RBAC validation
    const canRead = hasPermission(facilityCtx.role, "patient", "read");
    if (!canRead) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: Insufficient clinical permissions to inspect queue." },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // 4. Fetch strictly scoped to facility
    const queue = await getPatientQueue(env, facilityCtx.facilityId);

    return NextResponse.json(
      {
        ok: true,
        facilityId: facilityCtx.facilityId,
        facilityName: facilityCtx.facilityName,
        count: queue.length,
        queue,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { ok: false, error: msg },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
