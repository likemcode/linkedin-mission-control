import { NextRequest } from "next/server";
import { generateContent } from "@/lib/llm";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    // Get recent themes from existing ideas for context
    const existingIdeas = await prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { content: true, tags: true },
    });

    const existingContext = existingIdeas.length > 0
      ? `\n\nIdées récentes dans la banque (pour éviter les doublons):\n${existingIdeas.map((i) => `- ${i.content}`).join("\n")}`
      : "";

    const prompt = `Tu es un expert en stratégie de contenu LinkedIn. Génère 5 idées de posts LinkedIn sur le thème "${theme || "croissance professionnelle et leadership"}".${existingContext}

Chaque idée doit être:
- Une phrase claire et accrocheuse (max 120 caractères)
- Un angle original qui provoque l'engagement
- Variée (différents types: storytelling, tips, opinion, leçon, question)

Réponds UNIQUEMENT en JSON valide avec ce format:
{"ideas": ["Idée 1", "Idée 2", "Idée 3", "Idée 4", "Idée 5"]}`;

    const raw = await generateContent(prompt, { temperature: 0.9 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Could not parse AI response" }, { status: 500 });

    const result = JSON.parse(jsonMatch[0]);
    if (!result.ideas || !Array.isArray(result.ideas)) {
      return Response.json({ error: "Invalid response format" }, { status: 500 });
    }

    // Save generated ideas
    const saved = await Promise.all(
      result.ideas.map((content: string) =>
        prisma.idea.create({
          data: { content, tags: theme || "", status: "fresh" },
        })
      )
    );

    return Response.json({ ideas: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
