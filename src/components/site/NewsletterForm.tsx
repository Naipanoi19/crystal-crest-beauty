import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed });
    setBusy(false);
    if (error) {
      if (error.code === "23505") {
        toast.success("You're already on the list ✨");
        setEmail("");
        return;
      }
      toast.error("Couldn't subscribe right now. Please try again.");
      return;
    }
    toast.success("Welcome to the List — check your inbox soon.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 rounded-sm border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-ivory placeholder:text-ivory/45 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={busy}
        className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-rose px-6 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-luxe transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get Early Access <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></>}
      </button>
    </form>
  );
}
