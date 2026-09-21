import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { BRIEFING_PATH } from "@/constants/routes";
import { getSession } from "@/server/auth/get-session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) redirect(BRIEFING_PATH);

  return (
    <>
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="mt-2 text-paper-2">We email you a sign-in link. No password.</p>
      <LoginForm />
    </>
  );
}
