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

type ImproveOptions = {
  instructionOverride?: string;
  successMessage?: string;
};

type AssistantStatus =
  | { type: "idle" }
  | { type: "info"; message: string }
  | { type: "loading"; title: string; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function AssistantStatusPanel({ status }: { status: AssistantStatus }) {
  if (status.type === "idle") return null;

  const styles = {
    info: "border-blue-900/70 bg-blue-950/30 text-blue-200",
    loading: "border-purple-900/70 bg-purple-950/30 text-purple-200",
    success: "border-green-900/70 bg-green-950/30 text-green-200",
    error: "border-red-900/70 bg-red-950/30 text-red-200",
  }[status.type];

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      <div className="flex items-start gap-2">
        {status.type === "loading" && (
          <span className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" />
        )}
        {status.type === "success" && <span className="mt-0.5 shrink-0 text-green-300">✓</span>}
        {status.type === "error" && <span className="mt-0.5 shrink-0 text-red-300">!</span>}
        {status.type === "info" && <span className="mt-0.5 shrink-0 text-blue-300">i</span>}
        <div>
          {status.type === "loading" ? (
            <>
              <div className="font-medium">{status.title}</div>
              <div className="text-xs opacity-80">{status.message}</div>
            </>
          ) : (
            <div>{status.message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>({ type: "idle" });
  const [previousContent, setPreviousContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiPath("/api/templates")).then((r) => r.json()).then(setTemplates);
    fetch(apiPath("/api/series")).then((r) => r.json()).then(setSeriesList);
  }, []);

  async function runGenerate(options: ImproveOptions = {}) {
    const trimmedPrompt = prompt.trim();
    const trimmedContent = content.trim();
    const isImproving = Boolean(trimmedContent);
    const instruction = options.instructionOverride?.trim() || trimmedPrompt;

    if (!instruction && !isImproving) {
      setAssistantStatus({ type: "info", message: "Décris le sujet du post pour lancer la génération." });
      return;
    }

    if (isImproving) setPreviousContent(content);
    setGenerating(true);
    setAssistantStatus(
      isImproving
        ? {
            type: "loading",
            title: "Amélioration en cours...",
            message: "Friend retravaille ton post sans supprimer ton brouillon original.",
          }
        : {
            type: "loading",
            title: "Génération en cours...",
            message: "Friend prépare ton post LinkedIn. Ça peut prendre quelques secondes selon le modèle IA.",
          }
    );
    try {
      const selectedTemplate = templates.find((t) => t.id === templateId);
      const templateInstruction = selectedTemplate
        ? `\n\nUtilise cette structure:\n${selectedTemplate.structure}`
        : "";

      const res = await fetch(apiPath("/api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: (instruction || "Améliore ce post") + templateInstruction,
          existingContent: content || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAssistantStatus({ type: "error", message: data.error });
        return;
      }
      if (data.content) {
        setContent(data.content);
        setAssistantStatus({
          type: "success",
          message: options.successMessage ?? (isImproving
            ? "Post amélioré. Tu peux annuler si tu préfères l'ancienne version."
            : "Post généré. Relis, ajuste puis score-le."),
        });
      } else {
        setAssistantStatus({ type: "error", message: "La génération n'a pas retourné de contenu. Réessaie dans quelques secondes." });
      }
    } catch {
      setAssistantStatus({ type: "error", message: "La génération a échoué. Vérifie le modèle IA ou réessaie dans quelques secondes." });
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerate() {
    await runGenerate();
  }

  async function handleImproveWithFeedback() {
    if (!scoreResult || !content.trim()) return;
    await runGenerate({
      instructionOverride: `Améliore ce post LinkedIn en appliquant ce feedback: ${scoreResult.feedback}`,
      successMessage: "Post amélioré avec le feedback du score. Tu peux annuler si tu préfères l'ancienne version.",
    });
  }

  async function handleScore() {
    if (!content.trim()) {
      setAssistantStatus({ type: "info", message: "Écris ou génère un post avant de demander un score." });
      return;
    }
    setScoring(true);
    setAssistantStatus({
      type: "loading",
      title: "Analyse en cours...",
      message: "Analyse du hook, de la clarté, de la structure et du potentiel d'engagement.",
    });
    try {
      const res = await fetch(apiPath("/api/score"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId: post?.id }),
      });
      const data = await res.json();
      if (data.error) {
        setAssistantStatus({ type: "error", message: data.error });
      } else {
        setScoreResult(data);
        setAssistantStatus({ type: "success", message: "Score prêt. Utilise le feedback pour améliorer ton post." });
      }
    } catch {
      setAssistantStatus({ type: "error", message: "L'analyse du post a échoué. Réessaie dans quelques secondes." });
    } finally {
      setScoring(false);
    }
  }

  function handleUndoImprove() {
    if (previousContent === null) return;
    setContent(previousContent);
    setPreviousContent(null);
    setAssistantStatus({ type: "info", message: "Version précédente restaurée." });
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
  const hasContent = Boolean(content.trim());
  const hasPrompt = Boolean(prompt.trim());
  const isAssistantBusy = generating || scoring || recycling;
  const assistantHelp = !hasContent && !hasPrompt
    ? "Décris le sujet du post pour lancer la génération."
    : hasContent && !hasPrompt
      ? "Ajoute une instruction ou clique Améliorer pour une amélioration générale."
      : "Prêt à lancer l'assistant IA.";
  const scoreVerdict = scoreResult
    ? scoreResult.score >= 80
      ? { label: "Très bon potentiel", className: "text-green-300 bg-green-950/40 border-green-900/70" }
      : scoreResult.score >= 60
        ? { label: "À renforcer", className: "text-yellow-300 bg-yellow-950/40 border-yellow-900/70" }
        : { label: "À retravailler", className: "text-red-300 bg-red-950/40 border-red-900/70" }
    : null;

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
            disabled={isAssistantBusy}
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
              onKeyDown={(e) => e.key === "Enter" && !isAssistantBusy && handleGenerate()}
              disabled={isAssistantBusy}
              placeholder={hasContent ? "Instructions pour améliorer..." : "Sujet du post à générer..."}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleGenerate}
              disabled={isAssistantBusy || (!hasPrompt && !hasContent)}
              className="min-w-36 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {generating ? (hasContent ? "Amélioration en cours..." : "Génération en cours...") : hasContent ? "Améliorer" : "Générer un post"}
            </button>
          </div>

          <p className="text-xs text-gray-500">{assistantHelp}</p>

          <AssistantStatusPanel status={assistantStatus} />

          {previousContent !== null && !generating && (
            <button
              type="button"
              onClick={handleUndoImprove}
              className="text-xs text-purple-300 hover:text-purple-200 underline underline-offset-4"
            >
              Annuler l&apos;amélioration
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleScore}
              disabled={isAssistantBusy || !hasContent}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
            >
              {scoring ? "Analyse en cours..." : "Scorer ce post"}
            </button>
            {post && (
              <button
                onClick={handleRecycle}
                disabled={isAssistantBusy || !hasContent}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                {recycling ? "Recyclage..." : "Recycler sous un nouvel angle"}
              </button>
            )}
          </div>

          {!hasContent && (
            <p className="text-xs text-gray-600">Écris ou génère un post avant de demander un score.</p>
          )}
        </div>

        {/* Score result */}
        {scoreResult && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-sm text-gray-400">Score IA</span>
                <div
                  className={`text-3xl font-bold ${
                    scoreResult.score >= 80
                      ? "text-green-400"
                      : scoreResult.score >= 60
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {scoreResult.score}/100
                </div>
              </div>
              {scoreVerdict && (
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${scoreVerdict.className}`}>
                  {scoreVerdict.label}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-300 mb-4">{scoreResult.feedback}</p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-400">
              <div className="rounded border border-gray-800 bg-gray-950/50 p-2">
                <span className="font-medium text-gray-200">Hook</span> — la première ligne donne envie de lire.
              </div>
              <div className="rounded border border-gray-800 bg-gray-950/50 p-2">
                <span className="font-medium text-gray-200">Clarté</span> — une idée principale, pas trop de dispersion.
              </div>
              <div className="rounded border border-gray-800 bg-gray-950/50 p-2">
                <span className="font-medium text-gray-200">Structure</span> — paragraphes courts et scannables.
              </div>
              <div className="rounded border border-gray-800 bg-gray-950/50 p-2">
                <span className="font-medium text-gray-200">CTA</span> — une question ou prochaine action claire.
              </div>
            </div>

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

            <button
              type="button"
              onClick={handleImproveWithFeedback}
              disabled={isAssistantBusy || !hasContent}
              className="mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Améliorer avec ce feedback
            </button>
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
