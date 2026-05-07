"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Zap, Sparkles, Check, Calendar, Loader2, Clock } from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/components/ui/toast";

type Template = { id: string; name: string; description: string; category: string };
type BatchPost = { id: string; content: string; status?: "generating" | "done" | "error" };
type ProgressState = { total: number; completed: number; posts: BatchPost[] };

export default function BatchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [themes, setThemes] = useState("");
  const [count, setCount] = useState(5);
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ total: 0, completed: 0, posts: [] });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchScheduling, setBatchScheduling] = useState(false);

  useEffect(() => {
    fetch(apiPath("/api/templates")).then((r) => r.json()).then(setTemplates);
  }, []);

  async function handleGenerate() {
    if (!themes.trim()) return;
    setGenerating(true);
    const themeList = themes.split(",").map((t) => t.trim()).filter(Boolean);
    const totalCount = themeList.length > 1 ? themeList.length : count;
    setProgress({ total: totalCount, completed: 0, posts: [] });
    setSelected(new Set());

    try {
      // Generate posts one at a time with progress
      const generated: BatchPost[] = [];
      for (let i = 0; i < totalCount; i++) {
        const theme = themeList[i % themeList.length] || themeList[0];
        const res = await fetch(apiPath("/api/batch"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            themes: [theme],
            count: 1,
            templateId: templateId || undefined,
          }),
        });
        const data = await res.json();
        if (!data.error && data.posts?.[0]) {
          const post = { ...data.posts[0], status: "done" as const };
          generated.push(post);
          setProgress({ total: totalCount, completed: i + 1, posts: [...generated] });
        }
      }

      toast("success", `${generated.length} posts générés !`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Erreur");
    } finally {
      setGenerating(false);
    }
  }

  function toggleSelect(postId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === progress.posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(progress.posts.map((p) => p.id)));
    }
  }

  async function handleBatchSchedule() {
    if (selected.size === 0) return toast("warning", "Sélectionne au moins un post");
    setBatchScheduling(true);
    try {
      const selectedPosts = Array.from(selected);
      // Auto-schedule one post per day at 9am, starting tomorrow
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(9, 0, 0, 0);

      for (let i = 0; i < selectedPosts.length; i++) {
        const postDate = new Date(startDate);
        postDate.setDate(postDate.getDate() + i);

        await fetch(apiPath(`/api/posts/${selectedPosts[i]}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: progress.posts.find((p) => p.id === selectedPosts[i])?.content,
            status: "scheduled",
            scheduledAt: postDate.toISOString(),
          }),
        });
      }

      toast("success", `${selectedPosts.length} posts planifiés (1/jour à 9h)`);
      router.push("/calendar");
    } catch {
      toast("error", "Erreur lors de la planification");
    } finally {
      setBatchScheduling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-6 w-6 text-[var(--color-warning)]" />
          Mode Batch
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Génère plusieurs posts d&apos;un coup. Prépare ta semaine en 15 minutes.
        </p>
      </div>

      <div className="animate-fade-in-up stagger-1">
        <GlassCard padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Thèmes (séparés par des virgules)
              </label>
              <textarea
                value={themes}
                onChange={(e) => setThemes(e.target.value)}
                placeholder="leadership, productivité, IA, recrutement, mindset..."
                className="input-base w-full resize-none h-24"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Nombre de posts
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Template (optionnel)
                </label>
                <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="input-base w-full">
                  <option value="">Aucun — style libre</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <GradientButton
              onClick={handleGenerate}
              disabled={generating || !themes.trim()}
              loading={generating}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {generating
                ? `Génération... ${progress.completed}/${progress.total}`
                : <><Sparkles className="h-4 w-4" />Générer {count} posts</>}
            </GradientButton>
          </div>
        </GlassCard>
      </div>

      {/* Progress & Results */}
      {progress.total > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-success)]">
              {progress.completed}/{progress.total} posts générés
            </h2>
            {progress.posts.length > 0 && !generating && (
              <div className="flex gap-2">
                <button onClick={toggleAll} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
                  {selected.size === progress.posts.length ? "Désélectionner tout" : "Sélectionner tout"}
                </button>
                <GradientButton
                  onClick={handleBatchSchedule}
                  disabled={selected.size === 0 || batchScheduling}
                  loading={batchScheduling}
                  variant="secondary"
                  size="sm"
                >
                  <Calendar className="h-3.5 w-3.5" /> Planifier {selected.size > 0 ? selected.size : ""} (1/jour à 9h)
                </GradientButton>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {generating && progress.total > 0 && (
            <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                  background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {progress.posts.map((post, i) => (
              <GlassCard
                key={post.id}
                interactive
                padding="md"
                className={selected.has(post.id) ? "!border-[var(--color-accent-border)] glow-accent" : ""}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }}
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected.has(post.id)
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                        : "border-[var(--color-border-default)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    {selected.has(post.id) && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(`/editor/${post.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--color-text-muted)] font-medium">Post #{i + 1}</span>
                      {post.status === "generating" && (
                        <Loader2 className="h-3 w-3 text-[var(--color-accent)] animate-spin" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line line-clamp-4">
                      {post.content.slice(0, 200)}
                      {post.content.length > 200 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}

            {/* Loading placeholders */}
            {generating &&
              Array.from({ length: progress.total - progress.posts.length }).map((_, i) => (
                <GlassCard key={`loading-${i}`} padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[var(--color-bg-tertiary)] animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-16 bg-[var(--color-bg-tertiary)] rounded animate-shimmer" />
                      <div className="h-4 w-full bg-[var(--color-bg-tertiary)] rounded animate-shimmer" />
                      <div className="h-4 w-3/4 bg-[var(--color-bg-tertiary)] rounded animate-shimmer" />
                    </div>
                  </div>
                </GlassCard>
              ))}
          </div>

          {progress.posts.length > 0 && !generating && (
            <GradientButton onClick={() => router.push("/")} variant="ghost">
              Retour au Dashboard
            </GradientButton>
          )}
        </div>
      )}
    </div>
  );
}
