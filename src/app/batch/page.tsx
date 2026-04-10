"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
};

export default function BatchPage() {
  const router = useRouter();
  const [themes, setThemes] = useState("");
  const [count, setCount] = useState(5);
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ count: number; posts: { id: string; content: string }[] } | null>(null);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  async function handleGenerate() {
    if (!themes.trim()) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themes: themes.split(",").map((t) => t.trim()),
          count,
          templateId: templateId || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setResult(data);
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mode Batch</h1>
      <p className="text-gray-400 mb-6">
        Génère plusieurs posts d&apos;un coup à partir de tes thèmes. Parfait pour préparer ta semaine en 15 minutes.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Thèmes (séparés par des virgules)</label>
          <textarea
            value={themes}
            onChange={(e) => setThemes(e.target.value)}
            placeholder="leadership, productivité, recrutement, culture d'entreprise, IA..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 resize-none h-20 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre de posts</label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Template (optionnel)</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
            >
              <option value="">Aucun — style libre</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !themes.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
        >
          {generating ? "Génération en cours... (ça peut prendre 1-2 min)" : `Générer ${count} posts`}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-green-400">
            {result.count} posts générés et sauvegardés en brouillon !
          </h2>
          <div className="space-y-3">
            {result.posts.map((post, i) => (
              <div
                key={post.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-700 transition-colors"
                onClick={() => router.push(`/editor/${post.id}`)}
              >
                <span className="text-xs text-gray-500 mb-1 block">Post #{i + 1}</span>
                <p className="text-sm text-gray-300 whitespace-pre-line">
                  {post.content.slice(0, 200)}
                  {post.content.length > 200 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Retour au Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
