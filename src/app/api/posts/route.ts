import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await prisma.post.create({
    data: {
      content: body.content ?? "",
      status: body.status ?? "draft",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      seriesId: body.seriesId ?? null,
      templateId: body.templateId ?? null,
    },
  });
  return Response.json(post);
}
