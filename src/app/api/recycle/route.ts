import { NextRequest } from "next/server";
import { generateViaProvider, type ProviderConfig } from "@/lib/llm-providers";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { postId, angle, provider: providerOverride, apiKey, model } = await request.json();

  const original = await prisma.post.findUnique({ where: { id: postId } });
  if (!original) return Response.json({ error: "Post not found" }, { status: 404 });

  const promptText = `Tu es un expert en copywriting LinkedIn. Recycle ce post LinkedIn en le réécrivant sous un nouvel angle. Le message de fond reste le même mais la forme change complètement.

Post original:
${original.content}

Nouvel angle demandé: ${angle || "Trouve un angle différent et original"}

Réponds uniquement avec le nouveau post, sans explication.`;

  const config: ProviderConfig = {
    provider: providerOverride || "ollama",
    apiKey: apiKey || undefined,
    model: model || undefined,
  };

  try {
    const { content } = await generateViaProvider(promptText, config);
    const post = await prisma.post.create({
      data: {
        content,
        status: "draft",
        recycledFromId: original.id,
      },
    });
    return Response.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
