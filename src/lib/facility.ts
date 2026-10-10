import { getDb } from "@/db";
import { user, facilityMembers, facilities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { Role } from "@/lib/permissions";

export interface UserFacilityContext {
  userId: string;
  facilityId: string;
  facilityName: string;
  facilitySlug: string;
  role: Role;
  status: "active" | "suspended" | "invited";
}

/**
 * Resolves the user's active facility scope strictly from trusted server-side membership.
 * Never trust a client-supplied facility ID.
 */
export async function resolveUserFacility(
  env: CloudflareEnv,
  userId: string,
  requestedFacilityId?: string | null
): Promise<UserFacilityContext | null> {
  const db = getDb(env);

  // 1. Fetch user to confirm existence and baseline role
  const dbUser = await db.select().from(user).where(eq(user.id, userId)).get();
  if (!dbUser) return null;

  // 2. Query memberships
  const memberships = await db
    .select({
      id: facilityMembers.id,
      facilityId: facilityMembers.facilityId,
      facilityName: facilities.name,
      facilitySlug: facilities.slug,
      memberRole: facilityMembers.role,
      status: facilityMembers.status,
    })
    .from(facilityMembers)
    .innerJoin(facilities, eq(facilities.id, facilityMembers.facilityId))
    .where(and(eq(facilityMembers.userId, userId), eq(facilityMembers.status, "active")))
    .all();

  // If user has specific active facility memberships
  if (memberships.length > 0) {
    if (requestedFacilityId) {
      const match = memberships.find((m) => m.facilityId === requestedFacilityId);
      if (match) {
        return {
          userId,
          facilityId: match.facilityId,
          facilityName: match.facilityName,
          facilitySlug: match.facilitySlug,
          role: match.memberRole as Role,
          status: match.status as "active",
        };
      }
    }
    // Default to the first active membership
    const primary = memberships[0];
    return {
      userId,
      facilityId: primary.facilityId,
      facilityName: primary.facilityName,
      facilitySlug: primary.facilitySlug,
      role: primary.memberRole as Role,
      status: primary.status as "active",
    };
  }

  // Fallback: If no explicit facility_members row exists yet (e.g. legacy/new user),
  // bind to the default primary facility and create active membership automatically
  const defaultFacility = await db
    .select()
    .from(facilities)
    .where(eq(facilities.id, "facility-northstar-main"))
    .get();

  const userRole = (dbUser.role as Role) || "nurse";

  if (defaultFacility) {
    try {
      await db.insert(facilityMembers).values({
        id: crypto.randomUUID(),
        facilityId: defaultFacility.id,
        userId: dbUser.id,
        role: userRole,
        status: "active",
      });
    } catch {
      // Ignore if concurrent insert occurred
    }

    return {
      userId,
      facilityId: defaultFacility.id,
      facilityName: defaultFacility.name,
      facilitySlug: defaultFacility.slug,
      role: userRole,
      status: "active",
    };
  }

  return null;
}
