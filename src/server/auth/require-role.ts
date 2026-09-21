import { AuthorizationError } from "@/lib/errors";
import type { AuthSession, Role } from "@/types/auth";

/** Explicit allow-list, no hierarchy: `skylar` advisors must never inherit manager access. */
export function requireRole(session: AuthSession, allowed: readonly Role[]): void {
  if (!allowed.includes(session.role)) throw new AuthorizationError();
}
