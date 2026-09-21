import type { Metadata } from "next";
import { LogoutButton } from "@/components/auth/logout-button";
import { requirePageSession } from "@/server/auth/require-session";

export const metadata: Metadata = { title: "Briefing" };

// Placeholder until the Briefing engine (Phase 5). It proves the SSR session works.
export default async function BriefingPage() {
  const session = await requirePageSession();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-6 px-6 py-8 md:px-16">
      <h1 className="text-2xl font-medium">Briefing</h1>
      <p className="font-mono text-sm text-paper-2">
        {session.email} · {session.role} · {session.companyId}
      </p>
      <LogoutButton />
    </main>
  );
}
