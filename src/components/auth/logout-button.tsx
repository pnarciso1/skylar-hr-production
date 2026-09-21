"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LOGIN_PATH } from "@/constants/routes";
import { endServerSession } from "@/features/auth/session-client";

export function LogoutButton() {
  const [status, setStatus] = useState<"idle" | "pending" | "failed">("idle");

  async function logout() {
    setStatus("pending");
    try {
      await endServerSession();
      window.location.replace(LOGIN_PATH);
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={logout} disabled={status === "pending"}>
        {status === "pending" ? "Signing out…" : "Sign out"}
      </Button>
      {status === "failed" && (
        <p role="alert" className="mt-2 text-sm text-attention">
          Sign out failed. Try again.
        </p>
      )}
    </div>
  );
}
