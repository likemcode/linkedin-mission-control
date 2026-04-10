import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const idea = await prisma.idea.update({
    where: { id },
    data: {
      content: body.content,
      tags: body.tags,
      status: body.status,
    },
  });
  return Response.json(idea);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.idea.delete({ where: { id } });
  return Response.json({ ok: true });
}
