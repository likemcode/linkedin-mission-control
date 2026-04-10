"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Idea = {
  id: string;
  content: string;
  tags: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  fresh: "bg-green-900/50 text-green-400",
  developing: "bg-yellow-900/50 text-yellow-400",
  used: "bg-gray-800 text-gray-500",
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    fetch("/api/ideas").then((r) => r.json()).then(setIdeas);
  }, []);

  async function addIdea() {
    if (!newIdea.trim()) return;
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newIdea, tags: newTags }),
    });
    const idea = await res.json();
    setIdeas([idea, ...ideas]);
    setNewIdea("");
    setNewTags("");
  }

  async function deleteIdea(id: string) {
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    setIdeas(ideas.filter((i) => i.id !== id));
  }

  async function transformToPost(idea: Idea) {
    await fetch(`/api/ideas/${idea.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...idea, status: "used" }),
    });
    // Create a new post draft and redirect to editor
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: idea.content, status: "draft" }),
    });
    const post = await res.json();
    router.push(`/editor/${post.id}`);
  }

  async function updateStatus(idea: Idea, status: string) {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...idea, status }),
    });
    const updated = await res.json();
    setIdeas(ideas.map((i) => (i.id === idea.id ? updated : i)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banque d&apos;idées</h1>

      {/* Add idea */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <textarea
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Note une idée de post..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 resize-none h-20 focus:outline-none focus:border-blue-600 mb-2"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (séparés par des virgules)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
          />
          <button
            onClick={addIdea}
            disabled={!newIdea.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Ideas list */}
      <div className="space-y-3">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start gap-4"
          >
            <div className="flex-1">
              <p className="text-sm text-gray-200 mb-2">{idea.content}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded ${statusColors[idea.status]}`}>
                  {idea.status}
                </span>
                {idea.tags &&
                  idea.tags.split(",").map((tag) => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </div>
            <div className="flex gap-1">
              {idea.status === "fresh" && (
                <button
                  onClick={() => updateStatus(idea, "developing")}
                  className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-900 transition-colors"
                >
                  Développer
                </button>
              )}
              <button
                onClick={() => transformToPost(idea)}
                className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded hover:bg-blue-900 transition-colors"
              >
                Transformer en post
              </button>
              <button
                onClick={() => deleteIdea(idea.id)}
                className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded hover:bg-red-900 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {ideas.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune idée pour le moment. Commence à noter !</p>
        )}
      </div>
    </div>
  );
}
