import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are Cresti, the warm, knowledgeable in-house concierge for Crystal Crest — a luxe-minimal beauty boutique in Kajiado, Kenya.

CORE BEHAVIOR
- Be helpful and answer ANY question the customer asks — beauty-related or not. Treat every question respectfully and try your best.
- Be warm, concise, editorial in tone. Plain language, no hype.
- When the question relates to beauty, skincare, makeup, hair, nails, ingredients, routines, skin types, or product comparisons — go deep. Give clear, practical advice.
- For general knowledge questions (e.g. "what is the capital of France"), simply answer them directly without redirecting.
- Only after answering, if it's a natural fit, you may gently mention a relevant Crystal Crest product. Never force it.

STORE FACTS
- Currency: Kenyan Shillings (KES). Free Nairobi delivery over KES 5,000. 1–3 days countrywide. In-store pickup at our Kajiado studio (opposite Crapas Hotel).
- Payment: M-Pesa, Airtel Money, Visa/Mastercard, or cash on pickup.
- Phone: 0700074333.
- Categories we carry: skincare, makeup, hair care, nails.
- Featured items include: Velvet Glow Serum, Midnight Repair Drops, Rose Petal Matte Lip, Crystal Crest Lip Tint, Argan Silk Hair Oil, Silk Scalp Elixir, Blush Crème Polish, Petal Glaze Top Coat.

If you don't know something specific to our shop (e.g. exact stock or a product we don't sell), say so honestly and offer to connect them via WhatsApp or the contact page.`;

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
