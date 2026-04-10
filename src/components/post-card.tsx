type Post = {
  id: string;
  content: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
};

const statusColors: Record<string, string> = {
  draft: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
  scheduled: "bg-blue-900/50 text-blue-400 border-blue-800",
  published: "bg-green-900/50 text-green-400 border-green-800",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifié",
  published: "Publié",
};

export function PostCard({ post }: { post: Post }) {
  const preview =
    post.content.length > 150
      ? post.content.slice(0, 150) + "..."
      : post.content || "Post vide";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <span
          className={`text-xs px-2 py-0.5 rounded border ${statusColors[post.status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}
        >
          {statusLabels[post.status] ?? post.status}
        </span>
        {post.scheduledAt && (
          <span className="text-xs text-gray-500">
            {new Date(post.scheduledAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-300 whitespace-pre-line">{preview}</p>
    </div>
  );
}
