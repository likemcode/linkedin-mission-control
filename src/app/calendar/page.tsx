import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const posts = await prisma.post.findMany({
    where: {
      OR: [{ status: "scheduled" }, { status: "published" }],
    },
    orderBy: { scheduledAt: "asc" },
  });

  // Group posts by date
  const grouped: Record<string, typeof posts> = {};
  for (const post of posts) {
    const date = post.scheduledAt ?? post.publishedAt ?? post.createdAt;
    const key = new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(post);
  }

  const drafts = await prisma.post.findMany({
    where: { status: "draft" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendrier</h1>

      {Object.keys(grouped).length === 0 && drafts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Rien de planifié</p>
          <Link href="/editor" className="text-blue-400 hover:underline">
            Planifie ton premier post
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Scheduled / Published */}
          {Object.entries(grouped).map(([date, datePosts]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                {date}
              </h2>
              <div className="space-y-2">
                {datePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/editor/${post.id}`}
                    className="block bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          post.status === "published"
                            ? "bg-green-900/50 text-green-400"
                            : "bg-blue-900/50 text-blue-400"
                        }`}
                      >
                        {post.status === "published" ? "Publié" : "Planifié"}
                      </span>
                      {post.scheduledAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(post.scheduledAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {post.content.slice(0, 100)}
                      {post.content.length > 100 ? "..." : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Drafts section */}
          {drafts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                Brouillons non planifiés
              </h2>
              <div className="space-y-2">
                {drafts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/editor/${post.id}`}
                    className="block bg-gray-900 border border-yellow-900/30 rounded-lg p-3 hover:border-yellow-800/50 transition-colors"
                  >
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-400 mb-1 inline-block">
                      Brouillon
                    </span>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {post.content.slice(0, 100) || "Post vide"}
                      {post.content.length > 100 ? "..." : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
