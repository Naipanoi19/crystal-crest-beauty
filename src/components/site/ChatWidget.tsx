import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, GripVertical } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/utils/chat.functions";

interface Msg { role: "user" | "assistant"; content: string }

const STORAGE_KEY = "cresti.icon.pos";
const ICON = 56;

function loadPos(): { x: number; y: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p.x === "number" && typeof p.y === "number") return p;
  } catch {}
  return null;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi, I'm Cresti — your Crystal Crest concierge. Ask me anything about beauty, our products, or your routine." },
  ]);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(chatWithAssistant);

  // Init position bottom-right unless saved
  useEffect(() => {
    const saved = loadPos();
    if (saved) {
      setPos(saved);
    } else {
      setPos({ x: window.innerWidth - ICON - 20, y: window.innerHeight - ICON - 20 });
    }
  }, []);

  // Clamp on resize
  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: Math.max(8, Math.min(p.x, window.innerWidth - ICON - 8)),
        y: Math.max(8, Math.min(p.y, window.innerHeight - ICON - 8)),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
    setDragging(true);
  };

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    const nx = Math.max(8, Math.min(d.origX + dx, window.innerWidth - ICON - 8));
    const ny = Math.max(8, Math.min(d.origY + dy, window.innerHeight - ICON - 8));
    setPos({ x: nx, y: ny });
  }, []);

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    setDragging(false);
    if (d) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch {}
      if (!d.moved) setOpen((v) => !v);
    }
    dragRef.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

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
      setMessages((m) => [...m, { role: "assistant", content: "Sorry — something went wrong. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  // Panel anchored relative to icon position
  const panelStyle: React.CSSProperties = (() => {
    if (typeof window === "undefined") return {};
    const w = 352, h = 512, gap = 12;
    const showLeft = pos.x + ICON / 2 > window.innerWidth / 2;
    const showAbove = pos.y + ICON / 2 > window.innerHeight / 2;
    const left = showLeft ? Math.max(8, pos.x - w + ICON) : Math.min(window.innerWidth - w - 8, pos.x);
    const top = showAbove ? Math.max(8, pos.y - h - gap) : Math.min(window.innerHeight - h - 8, pos.y + ICON + gap);
    return { left, top, width: w, height: h };
  })();

  return (
    <>
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label={open ? "Close assistant (drag to move)" : "Open assistant (drag to move)"}
        title="Click to chat · Drag to move"
        style={{ left: pos.x, top: pos.y, touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] transition hover:scale-105 select-none"
      >
        {open ? <X className="h-5 w-5 pointer-events-none" /> : <MessageCircle className="h-5 w-5 pointer-events-none" />}
        <GripVertical className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent p-0.5 text-accent-foreground opacity-80 pointer-events-none" />
      </button>

      {open && (
        <div
          style={panelStyle}
          className="fixed z-50 flex max-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-sm border border-border bg-background shadow-2xl"
        >
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
              placeholder="Ask anything…"
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
