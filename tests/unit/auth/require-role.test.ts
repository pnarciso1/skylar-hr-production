import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/lib/errors";
import { requireRole } from "@/server/auth/require-role";
import type { AuthSession, Role } from "@/types/auth";

const sessionWith = (role: Role): AuthSession => ({
  uid: "u1",
  email: null,
  companyId: "company-a",
  role,
});

describe("requireRole", () => {
  it("allows a listed role", () => {
    expect(() => requireRole(sessionWith("manager"), ["manager", "admin"])).not.toThrow();
  });

  it("denies an unlisted role", () => {
    expect(() => requireRole(sessionWith("manager"), ["admin"])).toThrow(AuthorizationError);
  });

  it("does not treat the skylar advisor role as a manager", () => {
    expect(() => requireRole(sessionWith("skylar"), ["manager", "admin"])).toThrow(
      AuthorizationError,
    );
  });
});
