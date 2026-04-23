"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

type Series = {
  id: string;
  name: string;
  description: string;
  posts: { id: string; content: string; status: string }[];
};

export default function SeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(apiPath("/api/series")).then((r) => r.json()).then(setSeries);
  }, []);

  async function addSeries() {
    if (!newSeriesName.trim()) return;
    const res = await fetch(apiPath("/api/series"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSeriesName, description: newSeriesDesc }),
    });
    const s = await res.json();
    setSeries([s, ...series]);
    setNewSeriesName("");
    setNewSeriesDesc("");
    setShowForm(false);
  }

  async function deleteSeries(id: string) {
    if (!confirm("Supprimer cette série et détacher tous ses posts ?")) return;
    await fetch(apiPath(`/api/series/${id}`), { method: "DELETE" });
    setSeries(series.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-[var(--color-accent)]" />
            Séries
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Regroupe tes posts par thème pour créer des séries cohérentes.
          </p>
        </div>
        <GradientButton
          variant={showForm ? "secondary" : "primary"}
          size="md"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Annuler" : <><Plus className="h-4 w-4" /> Nouvelle Série</>}
        </GradientButton>
      </div>

      {/* Form */}
      {showForm && (
        <div className="animate-fade-in-up stagger-1">
          <GlassCard padding="md">
            <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Créer une série</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom de la série (ex: AWS pour les nuls)"
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
                className="input-base w-full"
              />
              <textarea
                placeholder="Description et objectifs de cette série..."
                value={newSeriesDesc}
                onChange={(e) => setNewSeriesDesc(e.target.value)}
                className="input-base w-full resize-none h-20"
              />
              <div className="flex justify-end gap-2 pt-2">
                <GradientButton onClick={addSeries} disabled={!newSeriesName.trim()} variant="primary">
                  Créer
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Series List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {series.length === 0 && !showForm ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={Layers}
              title="Aucune série"
              description="Crée ta première série pour regrouper tes publications."
              action={
                <GradientButton variant="primary" size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle Série
                </GradientButton>
              }
            />
          </div>
        ) : (
          series.map((s, i) => (
            <div key={s.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
              <GlassCard padding="md" className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      {s.name}
                      <span className="text-xs bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] font-medium">
                        {s.posts.length} post{s.posts.length !== 1 ? "s" : ""}
                      </span>
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-all"
                      title="Supprimer la série"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  {s.posts.length === 0 ? (
                    <div className="text-sm text-[var(--color-text-muted)] italic p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[var(--color-border-subtle)]">
                      Aucun post dans cette série. Sélectionne cette série dans l&apos;éditeur.
                    </div>
                  ) : (
                    s.posts.map((post, idx) => (
                      <div
                        key={post.id}
                        className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)] rounded-lg hover:border-[var(--color-border-hover)] transition-colors cursor-pointer group"
                        onClick={() => router.push(`/editor/${post.id}`)}
                      >
                        <div className="text-xs font-bold text-[var(--color-text-muted)] w-6 shrink-0">#{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                            {post.content || "Post vide"}
                          </p>
                        </div>
                        <StatusBadge status={post.status} />
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
