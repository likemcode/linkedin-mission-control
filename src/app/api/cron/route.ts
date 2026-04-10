import { prisma } from "@/lib/db";
import { publishToLinkedIn } from "@/lib/maton";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

  const duePosts = await prisma.post.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
  });

  const results = [];

  for (const post of duePosts) {
    try {
      await publishToLinkedIn(post.content);
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "published", publishedAt: new Date() },
      });
      await prisma.notification.create({
        data: {
          message: `Post publié avec succès: "${post.content.slice(0, 50)}..."`,
          type: "success",
        },
      });
      results.push({ id: post.id, success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await prisma.notification.create({
        data: {
          message: `Échec publication: ${message}`,
          type: "error",
        },
      });
      results.push({ id: post.id, success: false, error: message });
    }
  }

  return Response.json({
    checked: now.toISOString(),
    published: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    details: results,
  });
}
