import { NextRequest } from "next/server";
import { generateViaProvider, type ProviderConfig } from "@/lib/llm-providers";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { themes, count, templateId, provider: providerOverride, apiKey, model } = await request.json();

  let templateInstruction = "";
  if (templateId) {
    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (template) {
      templateInstruction = `\n\nUtilise cette structure pour chaque post:\n${template.structure}`;
    }
  }

  const promptText = `Tu es un expert en copywriting LinkedIn. Génère exactement ${count || 5} posts LinkedIn sur les thèmes suivants: ${themes.join(", ")}.${templateInstruction}

Chaque post doit être unique, engageant et optimisé pour LinkedIn.
Réponds UNIQUEMENT en JSON valide avec ce format exact:
{"posts": [{"content": "contenu du post 1", "theme": "thème utilisé"}, ...]}

Pas de commentaire, pas d'explication. Juste le JSON.`;

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

    const created = [];
    for (const p of result.posts) {
      const post = await prisma.post.create({
        data: {
          content: p.content,
          status: "draft",
          templateId: templateId || null,
        },
      });
      created.push(post);
    }

    return Response.json({ count: created.length, posts: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
