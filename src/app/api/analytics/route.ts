import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    include: { analytics: true },
    orderBy: { publishedAt: "desc" },
  });

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + (p.analytics?.likes ?? 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.analytics?.comments ?? 0), 0);
  const totalImpressions = posts.reduce((sum, p) => sum + (p.analytics?.impressions ?? 0), 0);
  const avgScore = posts.filter((p) => p.score).reduce((sum, p, _, arr) => sum + (p.score ?? 0) / arr.length, 0);

  return Response.json({
    summary: { totalPosts, totalLikes, totalComments, totalImpressions, avgScore: Math.round(avgScore) },
    posts,
  });
}
