export type Role = "nurse" | "doctor" | "admin";

export interface PermissionDefinition {
  resource: "patient" | "triage" | "status" | "audit" | "facility" | "user";
  action: "read" | "create" | "update" | "delete" | "override" | "manage";
}

export const ROLE_PERMISSIONS: Record<Role, Record<string, readonly string[]>> = {
  nurse: {
    patient: ["read", "create"],
    triage: ["assign", "override"],
    status: ["read"],
    audit: [],
    facility: ["read"],
    user: [],
  },
  doctor: {
    patient: ["read", "update"],
    triage: ["read"],
    status: ["update", "read"],
    audit: ["read"],
    facility: ["read"],
    user: [],
  },
  admin: {
    patient: ["read", "create", "update", "delete"],
    triage: ["assign", "override", "read"],
    status: ["update", "read"],
    audit: ["read"],
    facility: ["read", "manage"],
    user: ["manage", "read"],
  },
} as const;

export function hasPermission(
  role: string | undefined | null,
  resource: keyof typeof ROLE_PERMISSIONS["admin"],
  action: string
): boolean {
  if (!role || !(role in ROLE_PERMISSIONS)) return false;
  const typedRole = role as Role;
  const allowedActions = ROLE_PERMISSIONS[typedRole][resource];
  if (!allowedActions) return false;
  return allowedActions.includes(action);
}

// Allowed clinical status state machine
export const VALID_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  waiting: ["in_treatment"],
  in_treatment: ["admitted", "discharged", "waiting"], // waiting in case of re-triage or bed reassignment
  admitted: ["discharged"], // Admitted can transition to discharged
  discharged: [], // Discharged is terminal; cannot transition without new intake
};

export function isValidStatusTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  const transitions = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!transitions) return false;
  return transitions.includes(nextStatus);
}
