import { NextRequest } from "next/server";
import { generateContent } from "@/lib/llm";

export async function POST(request: NextRequest) {
  const { prompt, existingContent } = await request.json();

  let fullPrompt: string;

  if (existingContent) {
    fullPrompt = `Tu es un expert en copywriting LinkedIn. Améliore ce post LinkedIn en gardant le même message mais en le rendant plus engageant et percutant. Réponds uniquement avec le post amélioré, sans explication ni commentaire.\n\nPost actuel:\n${existingContent}\n\nInstructions supplémentaires: ${prompt || "Rends-le plus engageant"}`;
  } else {
    fullPrompt = `Tu es un expert en copywriting LinkedIn. Écris un post LinkedIn sur le sujet suivant. Le post doit être engageant, authentique et optimisé pour LinkedIn. Utilise des sauts de ligne pour aérer. Réponds uniquement avec le post, sans explication ni commentaire.\n\nSujet: ${prompt}`;
  }

  try {
    const content = await generateContent(fullPrompt);
    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
