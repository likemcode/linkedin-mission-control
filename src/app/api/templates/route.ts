import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { seedTemplates } from "@/lib/seed-templates";

export const dynamic = "force-dynamic";

export async function GET() {
  await seedTemplates();
  const templates = await prisma.template.findMany({
    orderBy: { name: "asc" },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, content: true, score: true },
      },
      _count: { select: { posts: true } },
    },
  });

  const result = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    structure: t.structure,
    category: t.category,
    createdAt: t.createdAt,
    usageCount: t._count.posts,
    lastPost: t.posts[0] ?? null,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const template = await prisma.template.create({
    data: {
      name: body.name,
      description: body.description ?? "",
      structure: body.structure ?? "",
      category: body.category ?? "general",
    },
  });
  return Response.json(template, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const template = await prisma.template.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.structure !== undefined && { structure: data.structure }),
      ...(data.category !== undefined && { category: data.category }),
    },
  });
  return Response.json(template);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await prisma.template.delete({ where: { id } });
  return Response.json({ ok: true });
}
