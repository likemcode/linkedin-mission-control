"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Wand2,
  History,
  Send,
  Calendar,
  Save,
  RefreshCcw,
  Target,
  Image as ImageIcon,
  Upload,
  Clock,
  Trash2,
} from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { ScoreRing } from "@/components/ui/score-ring";
import { useToast } from "@/components/ui/toast";
import { useProfile } from "@/components/profile-provider";
import { EditorToolbar } from "@/components/editor-toolbar";
import { CharacterGauge } from "@/components/character-gauge";
import { DiffView } from "@/components/diff-view";
import { LinkedInPreview } from "@/components/linkedin-preview";

type Post = {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  seriesId?: string | null;
  score?: number | null;
  scoreFeedback?: string | null;
  hashtags?: string | null;
  imageUrls?: string | null;
  documentUrl?: string | null;
} | null;

type Template = { id: string; name: string; structure: string };
type Series = { id: string; name: string };
type ScoreResult = { score: number; feedback: string; hashtags: string[] };
type ImproveOptions = { instructionOverride?: string; successMessage?: string };

type AssistantStatus =
  | { type: "idle" }
  | { type: "info"; message: string }
  | { type: "loading"; title: string; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function AssistantStatusPanel({ status }: { status: AssistantStatus }) {
  if (status.type === "idle") return null;

  const styles = {
    info: "border-[var(--color-info-muted)] bg-[var(--color-info-muted)] text-[var(--color-info)]",
    loading: "border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
    success: "border-[var(--color-success-muted)] bg-[var(--color-success-muted)] text-[var(--color-success)]",
    error: "border-[var(--color-error-muted)] bg-[var(--color-error-muted)] text-[var(--color-error)]",
  }[status.type];

  return (
    <div className={`rounded-xl border p-3 text-sm animate-scale-in ${styles}`}>
      <div className="flex items-start gap-3">
        {status.type === "loading" && (
          <span className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        <div>
          {status.type === "loading" ? (
            <>
              <div className="font-semibold leading-tight">{status.title}</div>
              <div className="text-xs opacity-80 mt-0.5">{status.message}</div>
            </>
          ) : (
            <div className="font-medium">{status.message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState(post?.content ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [imageUrl, setImageUrl] = useState(
    post?.imageUrls ? post.imageUrls.split(",").filter(Boolean)[0] ?? "" : ""
  );

  const [generating, setGenerating] = useState(false);
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
  const [showDiff, setShowDiff] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Profile data
  const { profile } = useProfile();

  // Auto-save
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(apiPath("/api/templates")).then((r) => r.json()).then(setTemplates);
    fetch(apiPath("/api/series")).then((r) => r.json()).then(setSeriesList);
  }, [post]);

  useEffect(() => {
    if (!post) {
      const local = localStorage.getItem("mc_draft");
      const localImg = localStorage.getItem("mc_draft_image");
      if (local && !content) {
        try {
          const parsed = JSON.parse(local);
          setContent(parsed.content || "");
          setImageUrl(parsed.imageUrl || "");
        } catch {
          setContent(local);
        }
        toast("info", "Brouillon local restauré");
      }
      if (localImg && !imageUrl) setImageUrl(localImg);
    }
  }, [post]); // eslint-disable-line

  useEffect(() => {
    if (!post && content) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        localStorage.setItem("mc_draft", JSON.stringify({ content, imageUrl }));
        setLastSaved(new Date());
      }, 3000);
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [content, imageUrl, post]);

  // Keyboard shortcuts
  const contentRef = useRef(content);
  contentRef.current = content;
  const promptRef = useRef(prompt);
  promptRef.current = prompt;
  const imageUrlRef = useRef(imageUrl);
  imageUrlRef.current = imageUrl;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runGenerate();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave("draft");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Image upload handler
  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(apiPath("/api/upload"), { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImageUrl(data.url);
      toast("success", "Image uploadée");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  }, [toast]);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadImage(file);
    } else {
      toast("warning", "Seules les images sont acceptées");
    }
  };

  function handleRemoveImage() {
    setImageUrl("");
    toast("info", "Image retirée");
  }

  // Best time suggestion
  function suggestBestTime() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ...
    const hour = now.getHours();

    // Find next Tue/Wed/Thu at 8h or 12h
    const targetDays = [2, 3, 4]; // Tue, Wed, Thu
    const targetHours = [8, 12];

    let bestDate = new Date(now);
    bestDate.setMinutes(0, 0, 0);

    for (let d = 0; d < 7; d++) {
      const checkDay = (day + d) % 7;
      if (d === 0 && hour >= 14) continue; // Skip today if past 14h
      if (targetDays.includes(checkDay)) {
        bestDate.setDate(bestDate.getDate() + d);
        // Pick best hour: if morning, 8h; otherwise 12h
        if (d === 0 && hour < 10) bestDate.setHours(8, 0, 0, 0);
        else bestDate.setHours(12, 0, 0, 0);
        break;
      }
    }

    setScheduledAt(bestDate.toISOString().slice(0, 16));
    toast("info", "Meilleur créneau suggéré : " + bestDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }));
  }

  async function runGenerate(options: ImproveOptions = {}) {
    const trimmedPrompt = prompt.trim();
    const trimmedContent = content.trim();
    const isImproving = Boolean(trimmedContent);
    const instruction = options.instructionOverride?.trim() || trimmedPrompt;

    if (!instruction && !isImproving) {
      toast("warning", "Décris le sujet du post pour lancer la génération.");
      return;
    }

    if (isImproving) {
      setPreviousContent(content);
      setShowDiff(false);
    }
    setGenerating(true);
    setAssistantStatus(
      isImproving
        ? { type: "loading", title: "Amélioration en cours...", message: "L'IA retravaille ton post..." }
        : { type: "loading", title: "Génération en cours...", message: "Création du post en cours..." }
    );

    try {
      const selectedTemplate = templates.find((t) => t.id === templateId);
      const templateInstruction = selectedTemplate ? `\n\nUtilise cette structure:\n${selectedTemplate.structure}` : "";

      const res = await fetch(apiPath("/api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: (instruction || "Améliore ce post") + templateInstruction,
          existingContent: content || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setContent(data.content);
      if (isImproving) setShowDiff(true);
      toast("success", options.successMessage ?? (isImproving ? "Post amélioré avec succès" : "Post généré"));
      setAssistantStatus({ type: "idle" });

      if (!isImproving) {
        fetch(apiPath("/api/score"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data.content, postId: post?.id }),
        })
          .then((r) => r.json())
          .then((scoreData) => {
            if (!scoreData.error) {
              setScoreResult(scoreData);
              toast("success", "Score IA automatique généré");
            }
          });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de génération";
      setAssistantStatus({ type: "error", message: msg });
      toast("error", msg);
    } finally {
      setGenerating(false);
    }
  }

  const handleGenerate = () => runGenerate();

  const handleImproveWithFeedback = () => runGenerate({
    instructionOverride: `Améliore ce post LinkedIn en appliquant ce feedback: ${scoreResult?.feedback}`,
    successMessage: "Post amélioré selon le feedback",
  });

  async function handleScore() {
    if (!content.trim()) return toast("warning", "Écris ou génère un post avant de scorer.");

    setScoring(true);
    setAssistantStatus({ type: "loading", title: "Analyse en cours...", message: "Évaluation du potentiel d'engagement..." });
    try {
      const res = await fetch(apiPath("/api/score"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId: post?.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setScoreResult(data);
      toast("success", "Score généré avec succès");
      setAssistantStatus({ type: "idle" });
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Erreur lors du scoring");
      setAssistantStatus({ type: "idle" });
    } finally {
      setScoring(false);
    }
  }

  function handleUndoDiff() {
    if (previousContent === null) return;
    setContent(previousContent);
    setPreviousContent(null);
    setShowDiff(false);
    toast("info", "Version précédente restaurée");
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
      if (data.error) throw new Error(data.error);
      toast("success", "Post recyclé");
      router.push(`/editor/${data.id}`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Erreur");
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
        imageUrls: imageUrl || null,
      };

      await fetch(apiPath(post ? `/api/posts/${post.id}` : "/api/posts"), {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!post) {
        localStorage.removeItem("mc_draft");
        localStorage.removeItem("mc_draft_image");
      }
      toast("success", status === "scheduled" ? "Post planifié" : "Brouillon sauvegardé");
      router.push("/");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!post) {
      // Save draft first, then publish
    }
    toast("success", "Post publié sur LinkedIn !");
    router.push("/");
  }

  const charCount = content.length;
  const isBusy = generating || scoring || recycling || saving;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">

      {/* COLUMN 1: AI Assistant (Left) */}
      <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 pb-8">
        <GlassCard padding="md" className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="font-semibold text-lg">Assistant IA</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                disabled={isBusy}
                className="input-base w-full text-sm"
              >
                <option value="">Style libre</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Prompt / Instructions
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isBusy}
                placeholder="Ex: Écris un post sur le recrutement tech..."
                className="input-base w-full resize-none h-24 text-sm"
              />
            </div>

            <GradientButton
              onClick={handleGenerate}
              disabled={isBusy || (!prompt && !content)}
              loading={generating}
              variant="primary"
              className="w-full justify-center py-2.5"
            >
              {content ? <><Wand2 className="h-4 w-4" /> Améliorer</> : <><Sparkles className="h-4 w-4" /> Générer</>}
            </GradientButton>

            {showDiff && previousContent && !generating && (
              <button
                onClick={handleUndoDiff}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <History className="h-3.5 w-3.5" /> Annuler l'amélioration
              </button>
            )}

            <AssistantStatusPanel status={assistantStatus} />
          </div>

          <hr className="border-[var(--color-border-subtle)] my-2" />

          {/* Scoring Section */}
          <div className="flex flex-col gap-3">
            <GradientButton
              onClick={handleScore}
              disabled={isBusy || !content}
              loading={scoring}
              variant="secondary"
              className="w-full justify-center"
            >
              <Target className="h-4 w-4 text-[var(--color-warning)]" />
              Évaluer le post
            </GradientButton>

            {scoreResult && (
              <div className="animate-fade-in-up mt-2 text-center bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)] rounded-xl p-4">
                <ScoreRing score={scoreResult.score} size={80} className="mx-auto mb-3" />
                <p className="text-xs text-[var(--color-text-secondary)] text-left mb-3 leading-relaxed">
                  {scoreResult.feedback}
                </p>
                <GradientButton
                  onClick={handleImproveWithFeedback}
                  disabled={isBusy}
                  variant="ghost"
                  size="sm"
                  className="w-full text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                >
                  <Wand2 className="h-3.5 w-3.5" /> Appliquer le feedback
                </GradientButton>
              </div>
            )}

            {post && (
              <GradientButton
                onClick={handleRecycle}
                disabled={isBusy || !content}
                loading={recycling}
                variant="ghost"
                size="sm"
                className="w-full justify-center mt-2"
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Recycler ce post
              </GradientButton>
            )}
          </div>
        </GlassCard>
      </div>

      {/* COLUMN 2: Editor (Center) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <GlassCard padding="none" className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
            <div className="flex items-center justify-between px-3 py-2">
              <EditorToolbar content={content} setContent={setContent} textareaRef={textareaRef} />
              {lastSaved && (
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 shrink-0">
                  <Save className="h-3 w-3" /> Auto-saved {lastSaved.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                </span>
              )}
            </div>
            {/* Character Gauge */}
            <div className="px-4 pb-2">
              <CharacterGauge count={charCount} />
            </div>
          </div>

          {/* Diff view or regular editor */}
          {showDiff && previousContent ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4">
                <DiffView oldText={previousContent} newText={content} onUndo={handleUndoDiff} />
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); setShowDiff(false); }}
                className="flex-1 w-full bg-transparent p-5 text-[var(--color-text-primary)] resize-none focus:outline-none text-[15px] leading-relaxed"
              />
            </div>
          ) : (
            <>
              {/* Drag & drop zone overlay */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative flex-1"
              >
                {dragOver && (
                  <div className="absolute inset-0 z-10 bg-[var(--color-accent)]/10 border-2 border-dashed border-[var(--color-accent)] rounded-lg flex items-center justify-center animate-fade-in">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-[var(--color-accent)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--color-accent)] font-medium">Dépose ton image ici</p>
                    </div>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écris ton post LinkedIn ici..."
                  className="w-full h-full bg-transparent p-5 text-[var(--color-text-primary)] resize-none focus:outline-none text-[15px] leading-relaxed"
                />
              </div>
            </>
          )}

          {/* Image uploaded indicator */}
          {imageUrl && (
            <div className="px-4 py-2 border-t border-[var(--color-border-subtle)] flex items-center gap-3 bg-[rgba(255,255,255,0.01)]">
              <img src={imageUrl} alt="Uploaded" className="h-10 w-10 rounded-lg object-cover border border-[var(--color-border-subtle)]" />
              <span className="text-xs text-[var(--color-text-secondary)] flex-1 truncate">Image attachée</span>
              <button onClick={handleRemoveImage} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </GlassCard>

        {/* Image upload button + Publish/Schedule */}
        <GlassCard padding="md" className="flex flex-col gap-3">
          {/* Image upload row */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] border border-dashed border-[var(--color-border-default)]">
              <ImageIcon className="h-4 w-4" />
              {uploading ? "Upload..." : imageUrl ? "Changer l'image" : "Ajouter une image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={suggestBestTime}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] border border-dashed border-[var(--color-border-default)]"
              title="Suggérer le meilleur créneau"
            >
              <Clock className="h-4 w-4" /> Meilleur moment
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Série</label>
                <select
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                  className="input-base w-full text-sm"
                >
                  <option value="">Aucune</option>
                  {seriesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Date de publication</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="input-base w-full text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <GradientButton onClick={() => handleSave("draft")} disabled={isBusy || !content} variant="secondary">
                <Save className="h-4 w-4" /> {post ? "Sauvegarder" : "Brouillon"}
              </GradientButton>
              {scheduledAt ? (
                <GradientButton onClick={() => handleSave("scheduled")} disabled={isBusy || !content} variant="primary">
                  <Calendar className="h-4 w-4" /> Planifier
                </GradientButton>
              ) : (
                <GradientButton onClick={handlePublish} disabled={isBusy || !content} variant="success">
                  <Send className="h-4 w-4" /> Publier
                </GradientButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* COLUMN 3: LinkedIn Preview (Right) */}
      <div className="lg:col-span-4 flex flex-col overflow-y-auto pb-8">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" /> Aperçu LinkedIn
        </h3>
        <LinkedInPreview content={content} profile={profile} imageUrl={imageUrl || undefined} />
      </div>
    </div>
  );
}
