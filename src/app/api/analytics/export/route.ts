import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";

  const posts = await prisma.post.findMany({
    where: { status: "published" },
    include: { analytics: true },
    orderBy: { publishedAt: "desc" },
  });

  if (format === "json") {
    return Response.json(posts);
  }

  // CSV format
  const headers = [
    "id", "content", "status", "score", "hashtags",
    "publishedAt", "likes", "comments", "reposts", "impressions",
  ];

  const csvRows = [headers.join(",")];

  for (const post of posts) {
    const row = [
      post.id,
      `"${(post.content || "").replace(/"/g, '""')}"`,
      post.status,
      post.score ?? "",
      `"${(post.hashtags || "").replace(/"/g, '""')}"`,
      post.publishedAt?.toISOString() ?? "",
      post.analytics?.likes ?? 0,
      post.analytics?.comments ?? 0,
      post.analytics?.reposts ?? 0,
      post.analytics?.impressions ?? 0,
    ];
    csvRows.push(row.join(","));
  }

  const csv = csvRows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
