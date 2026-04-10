import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    include: { posts: { orderBy: { seriesOrder: "asc" } } },
  });
  if (!series) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(series);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const series = await prisma.series.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
    },
  });
  return Response.json(series);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Unlink posts first
  await prisma.post.updateMany({
    where: { seriesId: id },
    data: { seriesId: null },
  });
  await prisma.series.delete({ where: { id } });
  return Response.json({ ok: true });
}
