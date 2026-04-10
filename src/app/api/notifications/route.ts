import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json(notifications);
}

export async function PUT(request: NextRequest) {
  // Mark all as read
  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return Response.json({ ok: true });
}
