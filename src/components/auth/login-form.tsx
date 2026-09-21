"use client";

import { sendSignInLinkToEmail } from "firebase/auth";
import { useState } from "react";
import { EmailForm } from "@/components/auth/email-form";
import { VERIFY_PATH } from "@/constants/routes";
import { saveMagicEmail } from "@/features/auth/magic-email";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Status = { phase: "idle" } | { phase: "failed" } | { phase: "sent"; email: string };

export function LoginForm() {
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  async function requestLink(email: string) {
    setStatus({ phase: "idle" });
    try {
      await sendSignInLinkToEmail(getFirebaseAuth(), email, {
        url: `${window.location.origin}${VERIFY_PATH}`,
        handleCodeInApp: true,
      });
    } catch {
      setStatus({ phase: "failed" });
      return;
    }
    saveMagicEmail(email);
    setStatus({ phase: "sent", email });
  }

  if (status.phase === "sent") {
    return (
      <p role="status" className="mt-8 text-paper-2">
        Check <span className="text-paper">{status.email}</span> for your sign-in link.
      </p>
    );
  }

  return (
    <>
      <EmailForm submitLabel="Email me a link" pendingLabel="Sending…" onSubmit={requestLink} />
      {status.phase === "failed" && (
        <p role="alert" className="mt-4 text-sm text-attention">
          The link could not be sent. Try again.
        </p>
      )}
    </>
  );
}
