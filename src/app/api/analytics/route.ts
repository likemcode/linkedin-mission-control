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
  const totalReposts = posts.reduce((sum, p) => sum + (p.analytics?.reposts ?? 0), 0);
  const avgScore = posts.filter((p) => p.score).reduce((sum, p, _, arr) => sum + (p.score ?? 0) / arr.length, 0);

  // Heatmap data: day-of-week (0-6) × hour-of-day (0-23)
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  let heatmapMax = 0;

  for (const post of posts) {
    if (!post.publishedAt) continue;
    const d = new Date(post.publishedAt);
    const day = d.getDay();
    const hour = d.getHours();
    const engagement = (post.analytics?.likes ?? 0) + (post.analytics?.comments ?? 0) * 2 + (post.analytics?.reposts ?? 0) * 3;
    heatmap[day][hour] += engagement;
    if (heatmap[day][hour] > heatmapMax) heatmapMax = heatmap[day][hour];
  }

  // AI Score vs Real Engagement correlation data
  const correlation = posts
    .filter((p) => p.score !== null && p.analytics !== null)
    .map((p) => ({
      id: p.id,
      content: p.content.slice(0, 80),
      score: p.score!,
      engagement: (p.analytics!.likes) + (p.analytics!.comments) * 2 + (p.analytics!.reposts) * 3,
      likes: p.analytics!.likes,
      comments: p.analytics!.comments,
      impressions: p.analytics!.impressions,
    }))
    .sort((a, b) => b.engagement - a.engagement);

  return Response.json({
    summary: {
      totalPosts,
      totalLikes,
      totalComments,
      totalImpressions,
      totalReposts,
      avgScore: Math.round(avgScore),
    },
    posts,
    heatmap,
    heatmapMax,
    correlation,
  });
}
