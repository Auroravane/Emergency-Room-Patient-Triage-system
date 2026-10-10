import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/patients/route";

// Mock @opennextjs/cloudflare
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn().mockRejectedValue(new Error("No CF context")),
}));

// Mock Better Auth to simulate unauthenticated, forged, or valid sessions
const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  createAuth: vi.fn().mockReturnValue({
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  }),
}));

describe("API Patient-Data Exposure Protection (/api/patients)", () => {
  it("rejects unauthenticated requests with HTTP 401 and Cache-Control: no-store", async () => {
    mockGetSession.mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/patients");
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(res.headers.get("Cache-Control")).toContain("no-store");

    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.queue).toBeUndefined();
    expect(data.error).toContain("Unauthorized");
  });

  it("rejects forged or expired session cookie with HTTP 401", async () => {
    mockGetSession.mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/patients", {
      headers: {
        Cookie: "better-auth.session_token=forged-or-expired-token",
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.queue).toBeUndefined();
  });
});
