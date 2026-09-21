import type { Metadata } from "next";
import { VerifyEmailLink } from "@/components/auth/verify-email-link";

// The URL carries a single-use sign-in code; never leak it through Referer.
export const metadata: Metadata = { title: "Signing in", referrer: "no-referrer" };

export default function VerifyPage() {
  return <VerifyEmailLink />;
}
