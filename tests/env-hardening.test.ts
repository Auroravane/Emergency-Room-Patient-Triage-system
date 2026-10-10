import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getEnv } from "@/lib/env";

describe("Production Environment & Secret Fail-Closed Hardening", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("fails closed when BETTER_AUTH_SECRET is missing in production mode", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.BETTER_AUTH_SECRET;

    await expect(getEnv()).rejects.toThrow(/FATAL: BETTER_AUTH_SECRET is not configured/);
  });

  it("allows configured secret in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "super-secret-production-key-at-least-32-chars";

    const env = await getEnv();
    expect(env.BETTER_AUTH_SECRET).toBe("super-secret-production-key-at-least-32-chars");
  });

  it("supplies local development secret only when NODE_ENV is development or test", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.BETTER_AUTH_SECRET;

    const env = await getEnv();
    expect(env.BETTER_AUTH_SECRET).toBeDefined();
    expect(env.BETTER_AUTH_SECRET.length).toBeGreaterThanOrEqual(32);
  });
});
