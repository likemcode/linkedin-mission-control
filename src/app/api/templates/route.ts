import { prisma } from "@/lib/db";
import { seedTemplates } from "@/lib/seed-templates";

export const dynamic = "force-dynamic";

export async function GET() {
  await seedTemplates();
  const templates = await prisma.template.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(templates);
}
