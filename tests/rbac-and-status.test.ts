import { describe, it, expect } from "vitest";
import { hasPermission, isValidStatusTransition } from "@/lib/permissions";

describe("Server-Side RBAC & Permissions Enforcement", () => {
  it("allows nurse to create patient intake and override triage", () => {
    expect(hasPermission("nurse", "patient", "create")).toBe(true);
    expect(hasPermission("nurse", "triage", "override")).toBe(true);
    expect(hasPermission("nurse", "patient", "read")).toBe(true);
  });

  it("denies nurse from updating clinical status or deleting patient", () => {
    expect(hasPermission("nurse", "status", "update")).toBe(false);
    expect(hasPermission("nurse", "patient", "delete")).toBe(false);
    expect(hasPermission("nurse", "audit", "read")).toBe(false);
  });

  it("allows doctor to update clinical status and read audit records", () => {
    expect(hasPermission("doctor", "status", "update")).toBe(true);
    expect(hasPermission("doctor", "patient", "read")).toBe(true);
    expect(hasPermission("doctor", "audit", "read")).toBe(true);
  });

  it("denies doctor from creating new patient intake or overriding nurse triage", () => {
    expect(hasPermission("doctor", "patient", "create")).toBe(false);
    expect(hasPermission("doctor", "triage", "override")).toBe(false);
  });

  it("grants admin full system permissions", () => {
    expect(hasPermission("admin", "patient", "create")).toBe(true);
    expect(hasPermission("admin", "patient", "update")).toBe(true);
    expect(hasPermission("admin", "status", "update")).toBe(true);
    expect(hasPermission("admin", "audit", "read")).toBe(true);
    expect(hasPermission("admin", "user", "manage")).toBe(true);
  });

  it("denies null, undefined, or unauthenticated role strings", () => {
    expect(hasPermission(null, "patient", "read")).toBe(false);
    expect(hasPermission(undefined, "patient", "read")).toBe(false);
    expect(hasPermission("guest", "patient", "read")).toBe(false);
    expect(hasPermission("attacker", "patient", "read")).toBe(false);
  });
});

describe("Clinical Status Progression State Machine", () => {
  it("permits progression from waiting to in_treatment", () => {
    expect(isValidStatusTransition("waiting", "in_treatment")).toBe(true);
  });

  it("permits progression from in_treatment to admitted or discharged", () => {
    expect(isValidStatusTransition("in_treatment", "admitted")).toBe(true);
    expect(isValidStatusTransition("in_treatment", "discharged")).toBe(true);
  });

  it("permits admitted to proceed to discharged", () => {
    expect(isValidStatusTransition("admitted", "discharged")).toBe(true);
  });

  it("rejects jumping directly from waiting to admitted or discharged without treatment", () => {
    expect(isValidStatusTransition("waiting", "admitted")).toBe(false);
    expect(isValidStatusTransition("waiting", "discharged")).toBe(false);
  });

  it("rejects modifying an already discharged patient (terminal status)", () => {
    expect(isValidStatusTransition("discharged", "in_treatment")).toBe(false);
    expect(isValidStatusTransition("discharged", "waiting")).toBe(false);
    expect(isValidStatusTransition("discharged", "admitted")).toBe(false);
  });

  it("rejects invalid status names", () => {
    expect(isValidStatusTransition("waiting", "unknown_state")).toBe(false);
    expect(isValidStatusTransition("invalid_state", "in_treatment")).toBe(false);
  });
});
