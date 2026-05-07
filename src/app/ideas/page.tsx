"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  GripVertical,
  Brain,
  Loader2,
} from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type Idea = {
  id: string;
  content: string;
  tags: string;
  status: string;
  createdAt: string;
};

const COLUMNS = [
  { key: "fresh", label: "Nouvelles", icon: Lightbulb, color: "var(--color-success)", bg: "var(--color-success-muted)" },
  { key: "developing", label: "En cours", icon: Brain, color: "var(--color-warning)", bg: "var(--color-warning-muted)" },
  { key: "used", label: "Utilisées", icon: Sparkles, color: "var(--color-text-muted)", bg: "rgba(255,255,255,0.05)" },
] as const;

export default function IdeasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [newTags, setNewTags] = useState("");
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genTheme, setGenTheme] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiPath("/api/ideas")).then((r) => r.json()).then(setIdeas);
  }, []);

  async function addIdea() {
    if (!newIdea.trim()) return;
    const res = await fetch(apiPath("/api/ideas"), {
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
    await fetch(apiPath(`/api/ideas/${id}`), { method: "DELETE" });
    setIdeas(ideas.filter((i) => i.id !== id));
  }

  async function moveIdea(ideaId: string, newStatus: string) {
    setMovingId(ideaId);
    // Optimistic update
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, status: newStatus } : i))
    );

    try {
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return;
      await fetch(apiPath(`/api/ideas/${ideaId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...idea, status: newStatus }),
      });
    } catch {
      // Revert on failure
      const originalStatus = ideas.find((i) => i.id === ideaId)?.status || "fresh";
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideaId ? { ...i, status: originalStatus } : i))
      );
    } finally {
      setMovingId(null);
    }
  }

  async function transformToPost(idea: Idea) {
    await fetch(apiPath(`/api/ideas/${idea.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...idea, status: "used" }),
    });
    const res = await fetch(apiPath("/api/posts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: idea.content, status: "draft" }),
    });
    const post = await res.json();
    setIdeas(ideas.map((i) => (i.id === idea.id ? { ...i, status: "used" } : i)));
    router.push(`/editor/${post.id}`);
  }

  async function handleGenerateIdeas() {
    if (!genTheme.trim()) return toast("warning", "Entre une thématique");
    setGenerating(true);
    try {
      const res = await fetch(apiPath("/api/ideas/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: genTheme }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIdeas([...data.ideas, ...ideas]);
      toast("success", `${data.ideas.length} idées générées !`);
      setGenTheme("");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Erreur");
    } finally {
      setGenerating(false);
    }
  }

  // Drag handlers
  const handleDragStart = (id: string) => setDragItemId(id);
  const handleDragEnd = () => {
    setDragItemId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOverCol(colKey);
  };

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (dragItemId) moveIdea(dragItemId, colKey);
    setDragOverCol(null);
    setDragItemId(null);
  };

  const getColIdeas = (status: string) => ideas.filter((i) => i.status === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-[var(--color-warning)]" />
            Banque d&apos;idées
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {ideas.length} idée{ideas.length !== 1 ? "s" : ""} au total · Glisse les cartes pour changer leur statut
          </p>
        </div>
      </div>

      {/* Quick add */}
      <div className="animate-fade-in-up stagger-1">
        <GlassCard padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
            <span className="text-sm font-medium">Nouvelle idée</span>
          </div>
          <textarea
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Note une idée de post..."
            className="input-base w-full resize-none h-20 mb-3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newIdea.trim()) {
                e.preventDefault();
                addIdea();
              }
            }}
          />
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (séparés par des virgules)"
                className="input-base flex-1"
              />
            </div>
            <GradientButton onClick={addIdea} disabled={!newIdea.trim()} variant="primary" size="md">
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </GradientButton>
          </div>
        </GlassCard>
      </div>

      {/* AI Generate */}
      <div className="animate-fade-in-up stagger-2">
        <GlassCard padding="md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Brain className="h-5 w-5 text-[var(--color-accent)]" />
              <span className="text-sm font-medium">Générer des idées</span>
            </div>
            <input
              type="text"
              value={genTheme}
              onChange={(e) => setGenTheme(e.target.value)}
              placeholder="Thématique (ex: leadership, IA, recrutement...)"
              className="input-base flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && genTheme.trim()) {
                  e.preventDefault();
                  handleGenerateIdeas();
                }
              }}
            />
            <GradientButton onClick={handleGenerateIdeas} disabled={!genTheme.trim() || generating} loading={generating} variant="secondary">
              <Sparkles className="h-4 w-4" /> Générer 5 idées
            </GradientButton>
          </div>
        </GlassCard>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col, colIdx) => {
          const colIdeas = getColIdeas(col.key);
          return (
            <div
              key={col.key}
              className={`animate-fade-in-up stagger-${Math.min(colIdx + 1, 5)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: col.color }} />
                  <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{col.label}</h2>
                  <span className="text-xs text-[var(--color-text-muted)]">({colIdeas.length})</span>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`min-h-[200px] rounded-xl transition-all duration-200 ${
                  dragOverCol === col.key
                    ? "bg-[var(--color-accent-muted)] border-2 border-dashed border-[var(--color-accent-border)]"
                    : "border-2 border-transparent"
                } space-y-2`}
              >
                {colIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={() => handleDragStart(idea.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all duration-300 ${
                      movingId === idea.id ? "opacity-50 scale-95" : "opacity-100"
                    } ${dragItemId === idea.id ? "opacity-50 rotate-1" : ""}`}
                  >
                    <GlassCard interactive padding="sm">
                      <div className="flex items-start gap-2">
                        <div className="cursor-grab active:cursor-grabbing text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors mt-0.5 shrink-0">
                          <GripVertical className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-primary)] mb-2">{idea.content}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {idea.tags &&
                              idea.tags.split(",").filter(Boolean).map((tag) => (
                                <span key={tag} className="text-xs bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)]">
                                  {tag.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => transformToPost(idea)}
                            className="btn btn-ghost btn-sm text-[var(--color-info)]"
                            title="Transformer en post"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteIdea(idea.id)}
                            className="btn btn-ghost btn-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}

                {colIdeas.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: col.bg }}
                    >
                      <col.icon className="h-5 w-5" style={{ color: col.color }} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {dragOverCol === col.key
                        ? "Dépose ici !"
                        : col.key === "fresh"
                          ? "Ajoute ou génère des idées"
                          : "Glisse une carte ici"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
