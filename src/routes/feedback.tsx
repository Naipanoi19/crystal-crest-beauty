import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Share feedback — Crystal Crest" }] }),
  component: Feedback,
});

function Feedback() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.from("feedback").insert({ customer_name: name, rating, message });
    setBusy(false);
    if (error) setErr(error.message); else setDone(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">We'd love to hear from you</p>
          <h1 className="mt-3 font-display text-4xl">Share your experience</h1>

          {done ? (
            <div className="mt-8 border border-border bg-cream/40 p-6 text-center">
              <p className="font-display text-2xl">Thank you ✦</p>
              <p className="mt-2 text-sm text-muted-foreground">Your feedback helps us refine the Crystal Crest edit.</p>
              <Link to="/" className="mt-4 inline-block text-sm text-accent underline">Back to home</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Your name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
              </label>
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Rating</span>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
                      <Star className={`h-7 w-7 ${i < rating ? "fill-accent stroke-accent" : "stroke-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Your thoughts</span>
                <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
              </label>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" size="lg" disabled={busy} className="w-full rounded-none bg-foreground text-background">{busy ? "Sending…" : "Submit feedback"}</Button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
