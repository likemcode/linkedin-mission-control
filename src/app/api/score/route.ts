import { NextRequest } from "next/server";
import { generateViaProvider, type ProviderConfig } from "@/lib/llm-providers";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { content, postId, provider: providerOverride, apiKey, model } = await request.json();

  const promptText = `Tu es un expert LinkedIn. Analyse ce post LinkedIn et donne:
1. Un score de 0 à 100 (basé sur: hook, clarté, engagement, CTA, longueur optimale)
2. Un feedback concret avec des suggestions d'amélioration

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{"score": 75, "feedback": "Le hook est bon mais...", "hashtags": ["#leadership", "#startup"]}

Post à analyser:
${content}`;

  const config: ProviderConfig = {
    provider: providerOverride || "ollama",
    apiKey: apiKey || undefined,
    model: model || undefined,
  };

  try {
    const raw = (await generateViaProvider(promptText, config)).content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Could not parse AI response" }, { status: 500 });
    }
    const result = JSON.parse(jsonMatch[0]);

    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          score: result.score,
          scoreFeedback: result.feedback,
          hashtags: (result.hashtags || []).join(","),
        },
      });
    }

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
