export type Role = "nurse" | "doctor" | "admin";

export const PERMISSIONS = {
  patient: {
    read: ["nurse", "doctor", "admin"],
    create: ["nurse", "admin"],
    update: ["doctor", "admin"],
  },
  triage: {
    assign: ["nurse", "admin"],
    override: ["nurse", "admin"],
  },
  status: {
    update: ["doctor", "admin"],
  },
  audit: {
    read: ["doctor", "admin"],
  },
} as const;

export function hasPermission(
  role: string | undefined,
  resource: keyof typeof PERMISSIONS,
  action: string
): boolean {
  if (!role) return false;
  const resourcePerms = PERMISSIONS[resource] as Record<string, readonly string[]> | undefined;
  if (!resourcePerms) return false;
  const allowedRoles = resourcePerms[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}
