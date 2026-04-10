import Link from "next/link";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/post-card";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  const drafts = posts.filter((p) => p.status === "draft");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/editor"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nouveau post
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-3xl font-bold text-yellow-400">{drafts.length}</div>
          <div className="text-sm text-gray-400">Brouillons</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-400">{scheduled.length}</div>
          <div className="text-sm text-gray-400">Planifiés</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">{published.length}</div>
          <div className="text-sm text-gray-400">Publiés</div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Aucun post pour le moment</p>
          <Link href="/editor" className="text-blue-400 hover:underline">
            Crée ton premier post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start gap-2">
              <Link href={`/editor/${post.id}`} className="flex-1">
                <PostCard post={post} />
              </Link>
              <DeleteButton postId={post.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
