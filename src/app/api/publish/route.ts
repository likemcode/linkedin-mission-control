import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { publishToLinkedIn } from "@/lib/maton";

export async function POST(request: NextRequest) {
  const { postId } = await request.json();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  try {
    await publishToLinkedIn(post.content);
    const updated = await prisma.post.update({
      where: { id: postId },
      data: { status: "published", publishedAt: new Date() },
    });
    return Response.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
