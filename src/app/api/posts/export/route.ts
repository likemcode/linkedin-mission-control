import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { analytics: true },
  });

  // Return all posts as JSON
  return Response.json(posts);
}
