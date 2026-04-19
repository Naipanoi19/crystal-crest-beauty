import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/utils/chat.functions";

interface Msg { role: "user" | "assistant"; content: string }

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi, I'm Cresti — your Crystal Crest concierge. Looking for a serum, a signature lip, or something for tired hair? Ask me anything." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(chatWithAssistant);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const result = await send({ data: { messages: next } });
      if (result.error) {
        setMessages((m) => [...m, { role: "assistant", content: result.error! }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: result.reply || "…" }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry — something went wrong." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] transition hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-sm border border-border bg-background shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-cream px-4 py-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <div>
              <p className="font-display text-base leading-tight">Cresti</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Beauty concierge</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${m.role === "user" ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-3.5 py-2 text-sm text-muted-foreground">Thinking…</div>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-border px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a product…"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground disabled:opacity-50" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
