"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useProfile } from "@/components/profile-provider";
import { Calendar, CheckCircle, Clock, FileText, PenSquare, TrendingUp, Activity, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

type Post = { id: string; content: string; status: string; scheduledAt: string | Date | null; score: number | null; createdAt: string | Date; publishedAt: string | Date | null; imageUrls?: string | null; seriesId?: string | null; seriesOrder?: number; templateId?: string | null };

export function DashboardClient({
  drafts, scheduled, published, avgScore, recentDrafts, upcomingScheduled, sparkline, scoreChange, allAnalytics,
}: {
  drafts: Post[];
  scheduled: Post[];
  published: Post[];
  avgScore: number;
  recentDrafts: Post[];
  upcomingScheduled: Post[];
  sparkline: number[];
  scoreChange: number;
  allAnalytics: any[];
}) {
  const { profile } = useProfile();
  const maxSpark = Math.max(...sparkline, 1);
  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const today = new Date();
  const dayLabels = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return weekDays[d.getDay()];
  });

  // Top posts by analytics
  const topPosts = allAnalytics
    .sort((a: any, b: any) => (b.likes + b.comments * 2 + b.reposts * 3) - (a.likes + a.comments * 2 + a.reposts * 3))
    .slice(0, 5);

  // Engagement summary
  const totalEngagement = allAnalytics.reduce((sum: number, a: any) => sum + a.likes + a.comments + a.reposts, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour {profile?.firstName ? profile.firstName : "👋"}, cette semaine…
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {drafts.length > 0
              ? `Tu as ${drafts.length} brouillon${drafts.length > 1 ? "s" : ""} à finaliser.`
              : published.length > 0
                ? "Tous tes posts sont en ordre ! 🎯"
                : "Prêt à créer ton premier post ?"}
          </p>
        </div>
        <Link href="/editor">
          <GradientButton variant="primary" size="md">
            <PenSquare className="h-4 w-4" />
            Nouveau post
          </GradientButton>
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up stagger-1">
          <KPICard icon={FileText} label="Brouillons" value={drafts.length} color="warning" />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <KPICard icon={Clock} label="Planifiés" value={scheduled.length} color="info" />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <KPICard icon={CheckCircle} label="Publiés" value={published.length} color="success" />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-[var(--color-accent-hover)] leading-tight">
                    {avgScore > 0 ? `${avgScore}` : "—"}
                  </span>
                  {scoreChange !== 0 && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${scoreChange > 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
                      {scoreChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(scoreChange)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] truncate">Score moyen IA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Sparkline */}
      <div className="animate-fade-in-up stagger-2">
        <GlassCard padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-[var(--color-accent)]" />
            <h2 className="text-sm font-semibold">Activité cette semaine</h2>
            <span className="text-xs text-[var(--color-text-muted)] ml-auto">{sparkline.reduce((a, b) => a + b, 0)} posts créés</span>
          </div>
          <div className="flex items-end gap-1 h-24">
            {sparkline.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max((val / maxSpark) * 100, val > 0 ? 4 : 0)}%`,
                    background: val > 0
                      ? "linear-gradient(to top, var(--color-accent), var(--color-accent-hover))"
                      : "rgba(255,255,255,0.04)",
                    minHeight: val > 0 ? "4px" : "0",
                  }}
                />
                <span className="text-[10px] text-[var(--color-text-muted)]">{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Main content: Drafts + Upcoming Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              Brouillons récents
            </h2>
            {drafts.length > 4 && (
              <Link href="/calendar" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                Voir tous →
              </Link>
            )}
          </div>

          {recentDrafts.length === 0 ? (
            <EmptyState
              icon={PenSquare}
              title="Aucun brouillon"
              description="Crée ton premier post LinkedIn avec l'assistant IA."
              action={
                <Link href="/editor">
                  <GradientButton variant="primary" size="sm">Créer un post</GradientButton>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {recentDrafts.map((post) => (
                <Link key={post.id} href={`/editor/${post.id}`}>
                  <GlassCard interactive padding="sm" className="group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[var(--color-text-primary)] line-clamp-2 group-hover:text-[var(--color-accent-hover)] transition-colors">
                          {post.content.slice(0, 120) || "Post vide"}
                          {post.content.length > 120 ? "..." : ""}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <StatusBadge status={post.status} />
                          {post.score !== null && (
                            <span className={`text-xs font-medium ${
                              post.score >= 80 ? "text-[var(--color-success)]"
                                : post.score >= 60 ? "text-[var(--color-warning)]"
                                : "text-[var(--color-error)]"
                            }`}>
                              Score: {post.score}
                            </span>
                          )}
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {formatRelativeDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      {post.score !== null && (
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          post.score >= 80 ? "bg-[var(--color-success-muted)] text-[var(--color-success)]"
                            : post.score >= 60 ? "bg-[var(--color-warning-muted)] text-[var(--color-warning)]"
                            : "bg-[var(--color-error-muted)] text-[var(--color-error)]"
                        }`}>
                          {post.score}
                        </div>
                      )}
                      {/* Progress bar for draft completion */}
                      {post.content.length > 0 && (
                        <div className="w-1 self-stretch rounded-full bg-[var(--color-bg-tertiary)] shrink-0">
                          <div
                            className="w-full rounded-full transition-all"
                            style={{
                              height: `${Math.min(100, (post.content.length / 2000) * 100)}%`,
                              background: post.content.length >= 800
                                ? "var(--color-success)"
                                : "var(--color-warning)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--color-info)]" />
              Prochaines publications
            </h2>
            <Link href="/calendar" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
              Calendrier →
            </Link>
          </div>

          {upcomingScheduled.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Rien de planifié"
              description="Planifie tes posts pour une publication automatique."
              action={
                <Link href="/editor">
                  <GradientButton variant="secondary" size="sm">Planifier un post</GradientButton>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {upcomingScheduled.map((post, i) => (
                <Link key={post.id} href={`/editor/${post.id}`}>
                  <GlassCard interactive padding="sm" className="group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[var(--color-info-muted)] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--color-info)]">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-hover)] transition-colors">
                          {post.content.slice(0, 80)}
                          {post.content.length > 80 ? "..." : ""}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {post.scheduledAt && formatScheduledDate(new Date(post.scheduledAt))}
                        </p>
                      </div>
                      <StatusBadge status="scheduled" />
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Posts + Engagement Summary */}
      {allAnalytics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-5">
          {/* Top 5 Posts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
                Top 5 posts
              </h2>
              <Link href="/analytics" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                Analytics →
              </Link>
            </div>
            <div className="space-y-2">
              {topPosts.map((item: any, i: number) => (
                <Link key={item.id} href={`/editor/${item.post?.id || item.postId}`}>
                  <GlassCard interactive padding="sm" className="group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--color-accent)]">
                        #{i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                          {item.post?.content?.slice(0, 80) || "Post"}
                          {(item.post?.content?.length || 0) > 80 ? "..." : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-0.5">👍 {item.likes}</span>
                        <span className="flex items-center gap-0.5">💬 {item.comments}</span>
                        <span className="flex items-center gap-0.5">🔄 {item.reposts}</span>
                      </div>
                      {item.post?.score && (
                        <span className={`text-xs font-bold shrink-0 ${
                          item.post.score >= 80 ? "text-[var(--color-success)]"
                            : item.post.score >= 60 ? "text-[var(--color-warning)]"
                            : "text-[var(--color-error)]"
                        }`}>
                          {item.post.score}
                        </span>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Engagement SVG Bar Chart */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-[var(--color-info)]" />
              <h2 className="text-base font-semibold">Engagement par post</h2>
            </div>
            <GlassCard padding="md">
              <svg viewBox="0 0 400 150" className="w-full">
                {topPosts.slice(0, 5).map((item: any, i: number) => {
                  const total = item.likes + item.comments * 2 + item.reposts * 3;
                  const maxVal = Math.max(...topPosts.map((a: any) => a.likes + a.comments * 2 + a.reposts * 3), 1);
                  const barWidth = (total / maxVal) * 280;
                  const y = 15 + i * 28;
                  return (
                    <g key={item.id}>
                      <text x="0" y={y + 12} className="text-[10px]" fill="#94a3b8" textAnchor="start">
                        {item.post?.content?.slice(0, 25) || "Post"}...
                      </text>
                      <rect
                        x="130"
                        y={y}
                        width={0}
                        height="18"
                        rx="4"
                        fill="var(--color-accent)"
                        opacity="0.8"
                      >
                        <animate attributeName="width" from="0" to={barWidth} dur="0.6s" fill="freeze" />
                      </rect>
                      <text
                        x={130 + barWidth + 5}
                        y={y + 13}
                        className="text-[10px]"
                        fill="#94a3b8"
                      >
                        {total}
                      </text>
                    </g>
                  );
                })}
                {topPosts.length === 0 && (
                  <text x="200" y="75" textAnchor="middle" className="text-xs" fill="#475569">
                    Pas encore de données
                  </text>
                )}
              </svg>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Published Posts */}
      {published.length > 0 && (
        <div className="animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
              Derniers posts publiés
            </h2>
            <Link href="/analytics" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
              Analytics →
            </Link>
          </div>
          <div className="space-y-2">
            {published.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/editor/${post.id}`}>
                <GlassCard interactive padding="sm" className="group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-hover)] transition-colors">
                        {post.content.slice(0, 100)}
                        {post.content.length > 100 ? "..." : ""}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        Publié {post.publishedAt ? formatRelativeDate(post.publishedAt) : ""}
                      </p>
                    </div>
                    {post.score !== null && (
                      <span className={`text-xs font-bold ${
                        post.score >= 80 ? "text-[var(--color-success)]"
                          : post.score >= 60 ? "text-[var(--color-warning)]"
                          : "text-[var(--color-error)]"
                      }`}>
                        {post.score}/100
                      </span>
                    )}
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeDate(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatScheduledDate(date: Date) {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Aujourd'hui à ${time}`;
  if (diffDays === 1) return `Demain à ${time}`;
  return `${date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })} à ${time}`;
}
