"use client";

import { LoaderCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SkylarContext = {
  employeeName?: string;
  cardTitle?: string;
  cardBody?: string;
};

type SkylarMessage = {
  role: "user" | "assistant";
  text: string;
};

type OpenSkylarEvent = CustomEvent<SkylarContext & { prompt?: string }>;

function SkylarMessageText({ text }: { text: string }) {
  const lines = text.replace(/\s+-\s+(?=\*\*)/g, "\n- ").split("\n");

  return (
    <div className="grid gap-2">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <span key={`space-${index}`} className="h-1" aria-hidden="true" />;
        if (trimmed.startsWith("- ")) {
          return (
            <div key={`bullet-${index}`} className="flex gap-2">
              <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-ink/45" aria-hidden="true" />
              <span>{formatSkylarInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={`line-${index}`}>{formatSkylarInline(trimmed)}</p>;
      })}
    </div>
  );
}

function formatSkylarInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

const starterPrompts = [
  "Help me prepare this conversation",
  "What should I save in the note?",
  "Make this sound calmer",
] as const;

export function FloatingSkylarAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState<SkylarContext>({});
  const [messages, setMessages] = useState<SkylarMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string, messageContext = context) => {
    const trimmed = text.trim();
    if (trimmed.length < 3 || isLoading) return;

    setDraft("");
    setError("");
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: "" }]);

    try {
      const result = await fetch("/api/briefing/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, ...messageContext }),
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
          if (parsed.text) {
            setMessages((current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (last?.role === "assistant") next[next.length - 1] = { ...last, text: last.text + parsed.text };
              return next;
            });
          }
        }

        if (done) break;
      }
    } catch (requestError) {
      setMessages((current) => current.filter((message, index) => !(index === current.length - 1 && message.role === "assistant" && !message.text)));
      setError(requestError instanceof Error ? requestError.message : "Skylar could not prepare this conversation.");
    } finally {
      setIsLoading(false);
    }
  }, [context, isLoading]);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (event as OpenSkylarEvent).detail;
      setContext(detail);
      setMessages([]);
      setError("");
      setIsOpen(true);
      if (detail.prompt) void sendMessage(detail.prompt, detail);
    }

    window.addEventListener("skylar:open", handleOpen);
    return () => window.removeEventListener("skylar:open", handleOpen);
  }, [sendMessage]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="skylar-shimmer fixed bottom-5 right-5 z-30 grid size-12 place-items-center overflow-hidden rounded-2xl bg-ink-2 text-paper shadow-[0_18px_50px_rgba(0,0,0,0.36),inset_0_0_0_1px_rgba(244,239,231,0.055),inset_0_1px_0_rgba(244,239,231,0.08)] transition-transform after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:bg-gradient-to-r after:from-transparent after:via-paper/20 after:to-transparent hover:-translate-y-0.5 md:bottom-5 md:right-5"
        aria-label="Ask Skylar"
      >
        <span
          aria-hidden="true"
          className="relative z-10 block size-8 bg-[url('/brand/logo.png')] bg-[length:28px_25px] bg-center bg-no-repeat"
        />
      </button>

      {isOpen && (
        <section className="fixed bottom-24 right-5 z-40 flex max-h-[calc(100dvh-7rem)] w-[calc(100vw-2.5rem)] max-w-[420px] flex-col overflow-hidden rounded-[20px] border border-paper/[0.08] bg-ink-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:bottom-24 md:right-6">
          <header className="flex items-start justify-between gap-4 border-b border-paper/[0.055] px-5 py-4">
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="block size-10 shrink-0 bg-[url('/brand/logo.png')] bg-[length:34px_31px] bg-center bg-no-repeat"
              />
              <div className="min-w-0">
                <p className="text-base font-semibold text-paper">Skylar assistant</p>
                <p className="mt-1 text-sm leading-5 text-paper-3">Prepare the conversation, one thoughtful step at a time.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper/[0.045] text-paper-2 transition-colors hover:bg-paper hover:text-ink"
              aria-label="Close Skylar assistant"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 overflow-y-auto px-5 py-5">
            {messages.length === 0 && (
              <>
                <p className="text-sm leading-6 text-paper-2">I can help with wording, next steps, or what belongs in the record.</p>
                <div className="mt-4 grid gap-2">
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="border border-paper/[0.08] bg-paper/[0.04] px-4 py-3 text-left text-sm text-paper-2 transition-colors hover:bg-paper hover:text-ink">
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="grid gap-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex items-end gap-2"}>
                  {message.role === "assistant" && (
                    <span aria-hidden="true" className="mb-1 block size-7 shrink-0 bg-[url('/brand/logo.png')] bg-[length:25px_23px] bg-center bg-no-repeat" />
                  )}
                  <div className={message.role === "user" ? "max-w-[84%] rounded-[14px] rounded-br-sm bg-paper/[0.09] px-4 py-3 text-sm leading-6 text-paper" : "max-w-[88%] rounded-[14px] rounded-bl-sm bg-paper px-4 py-3 text-sm leading-6 text-ink"}>
                    {message.text ? (message.role === "assistant" ? <SkylarMessageText text={message.text} /> : message.text) : (isLoading ? "Thinking..." : "")}
                  </div>
                </div>
              ))}
              {error && <p className="border-l-2 border-risk px-3 py-2 text-sm leading-6 text-risk">{error}</p>}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            className="border-t border-paper/[0.055] p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(draft);
            }}
          >
            <label className="sr-only" htmlFor="skylar-chat-input">
              Message Skylar
            </label>
            <div className="flex items-end gap-2 rounded-xl bg-paper/[0.04] p-2 shadow-[inset_0_0_0_1px_rgba(244,239,231,0.055),inset_0_1px_0_rgba(244,239,231,0.035)]">
              <textarea
                id="skylar-chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                placeholder="Ask Skylar what to say next..."
                className="min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-paper outline-none placeholder:text-paper-3"
              />
              <button
                type="submit"
                className="grid size-11 shrink-0 place-items-center rounded-lg bg-paper text-ink transition-opacity hover:opacity-90"
                aria-label="Send message"
              >
                {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
