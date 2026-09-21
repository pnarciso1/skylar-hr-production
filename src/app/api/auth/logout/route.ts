import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/constants/auth";
import { sessionCookieOptions } from "@/server/auth/session-cookie";
import { assertSameOrigin } from "@/server/guards/same-origin";
import { errorResponse } from "@/server/http/error-response";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const response = NextResponse.json({ ok: true });
    // ponytail: clears this browser's cookie only. Call adminAuth().revokeRefreshTokens(uid) to end every session.
    response.cookies.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0));
    return response;
  } catch (error) {
    return errorResponse(error, "POST /api/auth/logout");
  }
}
