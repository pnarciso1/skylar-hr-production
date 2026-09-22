"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEmployeeAction } from "@/features/briefing/create-actions";

export function DeleteEmployeeButton({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function removeEmployee() {
    if (!window.confirm(`Delete ${employeeName}'s employee file and all saved notes? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteEmployeeAction(employeeId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/people");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={removeEmployee}
        disabled={isPending}
        title="Delete employee file"
        aria-label={`Delete ${employeeName}'s employee file`}
        className="inline-flex size-10 items-center justify-center rounded-full bg-risk/[0.08] text-risk transition-colors hover:bg-risk hover:text-paper disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
      {error && <span role="alert" className="text-xs text-risk">{error}</span>}
    </div>
  );
}
