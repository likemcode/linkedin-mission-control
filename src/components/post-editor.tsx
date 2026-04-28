"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiPath } from "@/lib/routes";

type Post = {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  seriesId?: string | null;
  score?: number | null;
  scoreFeedback?: string | null;
  hashtags?: string | null;
} | null;

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: string;
};

type Series = {
  id: string;
  name: string;
};

type ScoreResult = {
  score: number;
  feedback: string;
  hashtags: string[];
};

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [content, setContent] = useState(post?.content ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [seriesId, setSeriesId] = useState(post?.seriesId ?? "");
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(
    post?.score ? { score: post.score, feedback: post.scoreFeedback ?? "", hashtags: post.hashtags?.split(",").filter(Boolean) ?? [] } : null
  );
  const [recycling, setRecycling] = useState(false);

  useEffect(() => {
    fetch(apiPath("/api/templates")).then((r) => r.json()).then(setTemplates);
    fetch(apiPath("/api/series")).then((r) => r.json()).then(setSeriesList);
  }, []);

  async function handleGenerate() {
    if (!prompt && !content) return;
    setGenerating(true);
    try {
      const selectedTemplate = templates.find((t) => t.id === templateId);
      const templateInstruction = selectedTemplate
        ? `\n\nUtilise cette structure:\n${selectedTemplate.structure}`
        : "";

      const res = await fetch(apiPath("/api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: (prompt || "Améliore ce post") + templateInstruction,
          existingContent: content || undefined,
        }),
      });
      const data = await res.json();
      if (data.content) setContent(data.content);
      if (data.error) alert(data.error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleScore() {
    if (!content) return;
    setScoring(true);
    try {
      const res = await fetch(apiPath("/api/score"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId: post?.id }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setScoreResult(data);
      }
    } finally {
      setScoring(false);
    }
  }

  async function handleRecycle() {
    if (!post) return;
    setRecycling(true);
    try {
      const res = await fetch(apiPath("/api/recycle"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, angle: prompt || undefined }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        router.push(`/editor/${data.id}`);
      }
    } finally {
      setRecycling(false);
    }
  }

  async function handleSave(status: "draft" | "scheduled") {
    setSaving(true);
    try {
      const body = {
        content,
        status,
        scheduledAt: status === "scheduled" ? scheduledAt || null : null,
        seriesId: seriesId || null,
      };

      if (post) {
        await fetch(apiPath(`/api/posts/${post.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(apiPath("/api/posts"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      router.push("/");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!post) {
      setSaving(true);
      try {
        const res = await fetch(apiPath("/api/posts"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, status: "draft" }),
        });
        const newPost = await res.json();
        setPublishing(true);
        const pubRes = await fetch(apiPath("/api/publish"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: newPost.id }),
        });
        const data = await pubRes.json();
        if (data.error) {
          alert(`Erreur publication: ${data.error}`);
        } else {
          router.push("/");
          router.refresh();
        }
      } finally {
        setSaving(false);
        setPublishing(false);
      }
      return;
    }

    setPublishing(true);
    try {
      await fetch(apiPath(`/api/posts/${post.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status: post.status }),
      });
      const res = await fetch(apiPath("/api/publish"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Erreur publication: ${data.error}`);
      } else {
        router.push("/");
        router.refresh();
      }
    } finally {
      setPublishing(false);
    }
  }

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Contenu du post</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écris ton post LinkedIn ici..."
            className="w-full h-64 bg-gray-900 border border-gray-800 rounded-lg p-4 text-gray-100 resize-none focus:outline-none focus:border-blue-600 transition-colors"
          />
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span>{charCount} caractères</span>
            <span>{wordCount} mots</span>
            <span>~{readTime} min de lecture</span>
            {charCount > 3000 && (
              <span className="text-yellow-400">Post long — LinkedIn tronquera après ~3000 caractères</span>
            )}
          </div>
        </div>

        {/* AI Generation */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
          <label className="block text-sm text-gray-400">Assistant IA</label>

          {/* Template selector */}
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
          >
            <option value="">Aucun template — style libre</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.description}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder={content ? "Instructions pour améliorer..." : "Sujet du post à générer..."}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || (!prompt && !content)}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {generating ? "..." : content ? "Améliorer" : "Générer"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleScore}
              disabled={scoring || !content}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
            >
              {scoring ? "Analyse..." : "Scorer ce post"}
            </button>
            {post && (
              <button
                onClick={handleRecycle}
                disabled={recycling || !content}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                {recycling ? "Recyclage..." : "Recycler sous un nouvel angle"}
              </button>
            )}
          </div>
        </div>

        {/* Score result */}
        {scoreResult && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-400">Score:</span>
              <span
                className={`text-2xl font-bold ${
                  scoreResult.score >= 80
                    ? "text-green-400"
                    : scoreResult.score >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {scoreResult.score}/100
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{scoreResult.feedback}</p>
            {scoreResult.hashtags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {scoreResult.hashtags.map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      if (!content.includes(h)) setContent(content + "\n\n" + h);
                    }}
                    className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-900 transition-colors cursor-pointer"
                  >
                    {h} +
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Series & Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Série</label>
            <select
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
            >
              <option value="">Aucune série</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Planifier pour</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !content}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Sauvegarde..." : "Brouillon"}
          </button>
          {scheduledAt && (
            <button
              onClick={() => handleSave("scheduled")}
              disabled={saving || !content}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Planifier
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || !content}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {publishing ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Aperçu LinkedIn</label>
          <div className="bg-white rounded-lg p-4 text-gray-900">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                J
              </div>
              <div>
                <div className="font-semibold text-sm">Josue</div>
                <div className="text-xs text-gray-500">Maintenant</div>
              </div>
            </div>
            <div className="text-sm whitespace-pre-line leading-relaxed">
              {content || <span className="text-gray-400 italic">Ton post apparaîtra ici...</span>}
            </div>
          </div>
        </div>

        {/* Template preview */}
        {templateId && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Structure du template</label>
            <pre className="text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-lg p-3 whitespace-pre-wrap">
              {templates.find((t) => t.id === templateId)?.structure}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
