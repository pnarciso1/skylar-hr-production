"use client";

import { ArrowRight, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import type { BriefingCard } from "@/features/briefing/types";

type ConversationPromptProps = {
  card: BriefingCard;
};

export function ConversationPrompt({ card }: ConversationPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("Help me prepare this conversation.");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendPrompt(event?: React.FormEvent) {
    event?.preventDefault();
    if (prompt.trim().length < 3 || isLoading) return;

    setIsOpen(true);
    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await fetch("/api/briefing/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          employeeName: card.subject,
          cardTitle: card.title,
          cardBody: card.body,
        }),
      });

      if (!result.ok || !result.body) {
        const payload = (await result.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(payload?.error?.message || "Skylar could not prepare this conversation.");
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event.split("\n").find((entry) => entry.startsWith("data: "));
          if (!line) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          const parsed = JSON.parse(data) as { text?: string; error?: string };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) setResponse((current) => current + parsed.text);
        }

        if (done) break;
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Skylar could not prepare this conversation.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          void sendPrompt();
        }}
        className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 font-semibold text-paper transition-colors hover:bg-ink-2 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <MessageCircle className="size-4" aria-hidden="true" />}
        <span>{isLoading ? "Skylar is thinking" : card.actions[0]?.label || "Prepare conversation"}</span>
        {!isLoading && <ArrowRight className="size-4" aria-hidden="true" />}
      </button>

      {isOpen && (
        <section className="border-t border-ink/10 pt-5" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-ink/45">Skylar&apos;s starting point</p>
              <p className="mt-1 text-sm text-ink/60">A practical prompt for the conversation ahead.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="grid size-8 place-items-center text-ink/50 transition-colors hover:text-ink" aria-label="Close Skylar response">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {response && <p className="mt-4 whitespace-pre-line text-base leading-7 text-ink/80">{response}</p>}
          {isLoading && !response && <p className="mt-4 text-base text-ink/55">Putting the context into words...</p>}
          {error && <p className="mt-4 border-l-2 border-risk px-3 py-2 text-sm font-semibold text-risk">{error}</p>}

          <form onSubmit={sendPrompt} className="mt-5 flex gap-2 border-t border-ink/10 pt-4">
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Ask Skylar a follow-up" className="min-w-0 flex-1 border-b border-ink/15 bg-transparent px-0 py-2 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ink" placeholder="Ask Skylar what to say next" />
            <button type="submit" disabled={isLoading || prompt.trim().length < 3} className="grid size-10 shrink-0 place-items-center bg-ink text-paper transition-opacity hover:opacity-85 disabled:opacity-40" aria-label="Send to Skylar">
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
