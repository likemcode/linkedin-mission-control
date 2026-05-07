"use client";

import { useEffect, useState } from "react";
import {
  BookTemplate,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Check,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type Template = {
  id: string;
  name: string;
  description: string;
  structure: string;
  category: string;
  usageCount: number;
  lastPost: { id: string; content: string; score: number | null } | null;
};

const categoryColors: Record<string, string> = {
  storytelling: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  tips: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "hot-take": "bg-red-500/15 text-red-400 border-red-500/20",
  transformation: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  lesson: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  carousel: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  bts: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  general: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const categories = ["storytelling", "tips", "hot-take", "transformation", "lesson", "carousel", "bts", "general"];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // New/edit form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStructure, setFormStructure] = useState("");
  const [formCategory, setFormCategory] = useState("general");

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const res = await fetch(apiPath("/api/templates"));
    const data = await res.json();
    setTemplates(data);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setSelected(null);
    setFormName("");
    setFormDesc("");
    setFormStructure("");
    setFormCategory("general");
  }

  function startEdit(t: Template) {
    setEditing(t);
    setCreating(false);
    setSelected(null);
    setFormName(t.name);
    setFormDesc(t.description);
    setFormStructure(t.structure);
    setFormCategory(t.category);
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSave() {
    if (!formName.trim()) return toast("warning", "Le nom est requis");
    setSaving(true);
    try {
      if (creating) {
        await fetch(apiPath("/api/templates"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            description: formDesc,
            structure: formStructure,
            category: formCategory,
          }),
        });
        toast("success", "Template créé");
      } else if (editing) {
        await fetch(apiPath("/api/templates"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            name: formName,
            description: formDesc,
            structure: formStructure,
            category: formCategory,
          }),
        });
        toast("success", "Template mis à jour");
      }
      cancelForm();
      fetchTemplates();
    } catch {
      toast("error", "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce template ?")) return;
    await fetch(apiPath(`/api/templates?id=${id}`), { method: "DELETE" });
    toast("info", "Template supprimé");
    setSelected(null);
    setEditing(null);
    fetchTemplates();
  }

  async function handleDuplicate(t: Template) {
    await fetch(apiPath("/api/templates"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${t.name} (copie)`,
        description: t.description,
        structure: t.structure,
        category: t.category,
      }),
    });
    toast("success", "Template dupliqué");
    fetchTemplates();
  }

  const isFormOpen = creating || editing !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookTemplate className="h-6 w-6 text-[var(--color-accent)]" />
            Templates
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {templates.length} template{templates.length !== 1 ? "s" : ""} · Structures de posts réutilisables
          </p>
        </div>
        <GradientButton onClick={startCreate} variant="primary" size="md">
          <Plus className="h-4 w-4" /> Nouveau
        </GradientButton>
      </div>

      {/* Create/Edit Form */}
      {isFormOpen && (
        <div className="animate-scale-in">
          <GlassCard padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {creating ? <><Plus className="h-4 w-4 text-[var(--color-accent)]" /> Nouveau template</> : <><Edit3 className="h-4 w-4 text-[var(--color-accent)]" /> Modifier {editing?.name}</>}
              </h3>
              <button onClick={cancelForm} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Nom</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nom du template" className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Catégorie</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="input-base w-full">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
                <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Courte description" className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Structure (prompt)</label>
                <textarea value={formStructure} onChange={(e) => setFormStructure(e.target.value)} placeholder="Structure du template..." className="input-base w-full resize-none h-32" />
              </div>
              <div className="flex gap-2 justify-end">
                <GradientButton onClick={cancelForm} variant="ghost" size="sm">Annuler</GradientButton>
                <GradientButton onClick={handleSave} variant="primary" size="sm" loading={saving}>
                  <Check className="h-3.5 w-3.5" /> Sauvegarder
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t, i) => (
          <div key={t.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
            <GlassCard
              interactive
              padding="md"
              className={selected?.id === t.id ? "!border-[var(--color-accent-border)] glow-accent" : ""}
            >
              <div className="cursor-pointer" onClick={() => setSelected(selected?.id === t.id ? null : t)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">{t.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[t.category] ?? categoryColors.general}`}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-[var(--color-text-muted)] mr-2">
                      {t.usageCount > 0 ? `Utilisé ${t.usageCount} fois` : "Jamais utilisé"}
                    </span>
                    <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[rgba(255,255,255,0.05)] transition-colors" title="Dupliquer">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-info)] hover:bg-[rgba(255,255,255,0.05)] transition-colors" title="Modifier">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[rgba(255,255,255,0.05)] transition-colors" title="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">{t.description}</p>

                {/* Last post preview */}
                {t.lastPost && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-3 w-3 text-[var(--color-text-muted)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">Dernier post généré</span>
                      {t.lastPost.score !== null && (
                        <span className={`text-xs font-bold ml-auto ${
                          t.lastPost.score >= 80 ? "text-[var(--color-success)]"
                            : t.lastPost.score >= 60 ? "text-[var(--color-warning)]"
                            : "text-[var(--color-error)]"
                        }`}>
                          Score {t.lastPost.score}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{t.lastPost.content.slice(0, 150)}</p>
                    <Link
                      href={`/editor/${t.lastPost.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] mt-1 transition-colors"
                    >
                      Voir le post <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {selected?.id === t.id && (
                  <pre className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded-xl p-4 mt-3 whitespace-pre-wrap animate-fade-in border border-[var(--color-border-subtle)]">
                    {t.structure}
                  </pre>
                )}
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}
