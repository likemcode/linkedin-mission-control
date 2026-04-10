import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(ideas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const idea = await prisma.idea.create({
    data: {
      content: body.content,
      tags: body.tags ?? "",
      status: body.status ?? "fresh",
    },
  });
  return Response.json(idea);
}
