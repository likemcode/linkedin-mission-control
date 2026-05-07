import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard-client";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  const drafts = posts.filter((p) => p.status === "draft");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");

  const scoredPosts = posts.filter((p) => p.score !== null);
  const avgScore = scoredPosts.length > 0
    ? Math.round(scoredPosts.reduce((sum, p) => sum + (p.score ?? 0), 0) / scoredPosts.length)
    : 0;

  // Weekly activity sparkline data (last 7 days)
  const now = new Date();
  const sparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    sparkline.push(
      posts.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= dayStart && d <= dayEnd;
      }).length
    );
  }

  // Score change this week vs last week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekScored = scoredPosts.filter((p) => {
    const d = p.publishedAt ? new Date(p.publishedAt) : new Date(p.createdAt);
    return d >= weekAgo;
  });
  const lastWeekScored = scoredPosts.filter((p) => {
    const d = p.publishedAt ? new Date(p.publishedAt) : new Date(p.createdAt);
    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    return d >= twoWeeksAgo && d < weekAgo;
  });
  const thisWeekAvg = thisWeekScored.length > 0
    ? Math.round(thisWeekScored.reduce((sum, p) => sum + (p.score ?? 0), 0) / thisWeekScored.length)
    : 0;
  const lastWeekAvg = lastWeekScored.length > 0
    ? Math.round(lastWeekScored.reduce((sum, p) => sum + (p.score ?? 0), 0) / lastWeekScored.length)
    : 0;
  const scoreChange = thisWeekAvg && lastWeekAvg ? thisWeekAvg - lastWeekAvg : 0;

  const recentDrafts = drafts.slice(0, 4);
  const upcomingScheduled = scheduled
    .filter((p) => p.scheduledAt && new Date(p.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 5);

  // Analytics summary
  const allAnalytics = await prisma.postAnalytics.findMany({
    include: { post: { select: { id: true, content: true, score: true, publishedAt: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <OnboardingWizard />
      <DashboardClient
      drafts={drafts}
      scheduled={scheduled}
      published={published}
      avgScore={avgScore}
      recentDrafts={recentDrafts}
      upcomingScheduled={upcomingScheduled}
      sparkline={sparkline}
      scoreChange={scoreChange}
      allAnalytics={JSON.parse(JSON.stringify(allAnalytics))}
    />
    </>
  );
}
