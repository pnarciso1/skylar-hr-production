import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ExternalServiceError, toErrorResponse } from "@/lib/errors";
import { getServerEnv } from "@/lib/env/server";
import { requireSession } from "@/server/auth/require-session";

const conversationInputSchema = z.object({
  prompt: z.string().trim().min(3).max(1200),
  employeeName: z.string().trim().max(120).optional(),
  cardTitle: z.string().trim().max(240).optional(),
  cardBody: z.string().trim().max(1200).optional(),
});

const systemPrompt = `You are Skylar, a calm HR briefing assistant. Help a people manager prepare for a fair, human conversation. Keep responses practical and concise. Do not give legal advice, diagnose people, or recommend punitive action. Ask one useful follow-up question when context is missing. Use plain language and never mention being an AI.`;

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const env = getServerEnv();

    if (!env.ANTHROPIC_API_KEY) {
      throw new ExternalServiceError("Skylar is not connected yet. Add ANTHROPIC_API_KEY to enable conversation help.");
    }

    const input = conversationInputSchema.parse(await request.json());
    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const stream = await anthropic.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 600,
      stream: true,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            `Employee: ${input.employeeName || "Not specified"}`,
            `Briefing focus: ${input.cardTitle || "Not specified"}`,
            `Existing context: ${input.cardBody || "Not specified"}`,
            `Manager request: ${input.prompt}`,
          ].join("\n\n"),
        },
      ],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: toErrorResponse(error).body.error.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return Response.json(response.body, { status: response.status });
  }
}
