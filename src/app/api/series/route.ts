import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const series = await prisma.series.findMany({
    include: { posts: { orderBy: { seriesOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(series);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const series = await prisma.series.create({
    data: {
      name: body.name,
      description: body.description ?? "",
    },
  });
  return Response.json(series);
}
