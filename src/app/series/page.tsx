"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiPath } from "@/lib/routes";

type Series = {
  id: string;
  name: string;
  description: string;
  posts: { id: string; content: string; status: string }[];
};

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetch(apiPath("/api/series")).then((r) => r.json()).then(setSeriesList);
  }, []);

  async function createSeries() {
    if (!newName.trim()) return;
    const res = await fetch(apiPath("/api/series"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    const series = await res.json();
    setSeriesList([{ ...series, posts: [] }, ...seriesList]);
    setNewName("");
    setNewDesc("");
  }

  async function deleteSeries(id: string) {
    await fetch(apiPath(`/api/series/${id}`), { method: "DELETE" });
    setSeriesList(seriesList.filter((s) => s.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Séries de posts</h1>

      {/* Create series */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la série"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optionnel)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
          />
          <button
            onClick={createSeries}
            disabled={!newName.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Créer
          </button>
        </div>
      </div>

      {/* Series list */}
      <div className="space-y-4">
        {seriesList.map((series) => (
          <div key={series.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-lg">{series.name}</h2>
                {series.description && (
                  <p className="text-sm text-gray-400">{series.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                  {series.posts.length} post{series.posts.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => deleteSeries(series.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
            {series.posts.length > 0 ? (
              <div className="space-y-2">
                {series.posts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/editor/${post.id}`}
                    className="block bg-gray-800 rounded p-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-500 mr-2">#{i + 1}</span>
                    {post.content.slice(0, 80)}
                    {post.content.length > 80 ? "..." : ""}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Aucun post dans cette série. Assigne des posts depuis l&apos;éditeur.
              </p>
            )}
          </div>
        ))}
        {seriesList.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune série. Crée ta première série thématique !</p>
        )}
      </div>
    </div>
  );
}
