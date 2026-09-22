"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import type { BriefingCard } from "@/features/briefing/types";

export function PrepareConversationButton({ card }: { card: BriefingCard }) {
  function openAssistant() {
    window.dispatchEvent(
      new CustomEvent("skylar:open", {
        detail: {
          employeeName: card.subject,
          cardTitle: card.title,
          cardBody: card.body,
          prompt: "Help me prepare this conversation.",
        },
      }),
    );
  }

  return (
    <button
      type="button"
      onClick={openAssistant}
      className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 font-semibold text-paper transition-colors hover:bg-ink-2 sm:min-w-40"
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      <span>{card.actions[0]?.label || "Prepare conversation"}</span>
      <ArrowRight className="size-4" aria-hidden="true" />
    </button>
  );
}
