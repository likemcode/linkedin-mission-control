import { NextRequest } from "next/server";
import { generateViaProvider, type ProviderConfig } from "@/lib/llm-providers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const config: ProviderConfig = {
    provider: body.provider || "deepseek",
    apiKey: body.apiKey,
    model: body.model || "",
    baseUrl: body.baseUrl,
  };

  try {
    const result = await generateViaProvider(
      'Réponds uniquement "OK" en toutes lettres. Pas d\'autre texte.',
      config,
    );
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 200 });
  }
}
