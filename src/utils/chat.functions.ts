import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are Cresti, the friendly in-house concierge for Crystal Crest, a luxe-minimal beauty boutique in Kenya.
You help shoppers discover skincare, makeup, hair care, and nail products from our curated edit.
Be warm, concise, and editorial in tone. Prices are in Kenyan Shillings (KES).
We carry: Velvet Glow Serum (skincare), Rose Petal Matte Lip & Crystal Crest Lip Tint (makeup),
Argan Silk Hair Oil & Silk Scalp Elixir (hair), Blush Crème Polish & Petal Glaze Top Coat (nails),
Midnight Repair Drops (skincare). Suggest products by name when relevant.
For shipping: free in Nairobi over KES 5,000. Payment options: M-Pesa, Airtel Money, or cash on delivery / in-store pickup.
If asked something outside beauty or our store, gently redirect to how you can help with their beauty routine.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "AI is not configured. Please try again later." };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
        }),
      });

      if (res.status === 429) return { reply: "", error: "We're getting lots of requests right now — please try again in a moment." };
      if (res.status === 402) return { reply: "", error: "AI credits are exhausted. Please add funds to continue." };
      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        return { reply: "", error: "Sorry, I couldn't reach the assistant right now." };
      }

      const json = await res.json();
      const reply: string = json?.choices?.[0]?.message?.content ?? "";
      return { reply, error: null as string | null };
    } catch (e) {
      console.error("chat error:", e);
      return { reply: "", error: "Something went wrong. Please try again." };
    }
  });
