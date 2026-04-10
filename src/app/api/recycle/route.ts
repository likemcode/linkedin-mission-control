import { NextRequest } from "next/server";
import { generateContent } from "@/lib/claude";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { postId, angle } = await request.json();

  const original = await prisma.post.findUnique({ where: { id: postId } });
  if (!original) return Response.json({ error: "Post not found" }, { status: 404 });

  const prompt = `Tu es un expert en copywriting LinkedIn. Recycle ce post LinkedIn en le réécrivant sous un nouvel angle. Le message de fond reste le même mais la forme change complètement.

Post original:
${original.content}

Nouvel angle demandé: ${angle || "Trouve un angle différent et original"}

Réponds uniquement avec le nouveau post, sans explication.`;

  try {
    const content = await generateContent(prompt);
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
