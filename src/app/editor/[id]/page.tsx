import { prisma } from "@/lib/db";
import { PostEditor } from "@/components/post-editor";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier le post</h1>
      <PostEditor
        post={{
          id: post.id,
          content: post.content,
          status: post.status,
          scheduledAt: post.scheduledAt?.toISOString() ?? null,
          seriesId: post.seriesId,
          score: post.score,
          scoreFeedback: post.scoreFeedback,
          hashtags: post.hashtags,
        }}
      />
    </div>
  );
}
