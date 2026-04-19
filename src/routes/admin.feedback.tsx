import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

export const Route = createFileRoute("/admin/feedback")({ component: FeedbackAdmin });

interface FRow { id: string; customer_name: string; rating: number; message: string; created_at: string }

function FeedbackAdmin() {
  const [rows, setRows] = useState<FRow[]>([]);
  useEffect(() => {
    supabase.from("feedback").select("id, customer_name, rating, message, created_at").order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div>
      <h2 className="font-display text-2xl">Customer feedback</h2>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No feedback yet.</p> : (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="border border-border bg-cream/40 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.customer_name}</p>
                <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-accent stroke-accent" : "stroke-muted-foreground"}`} />)}</div>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{r.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
