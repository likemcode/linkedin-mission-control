"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  RefreshCw,
  Target,
  Zap,
  Download,
  FileJson,
} from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { KPICard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientButton } from "@/components/ui/gradient-button";

type PostWithAnalytics = {
  id: string;
  content: string;
  score: number | null;
  publishedAt: string;
  analytics: {
    likes: number;
    comments: number;
    reposts: number;
    impressions: number;
  } | null;
};

type Summary = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalImpressions: number;
  totalReposts: number;
  avgScore: number;
};

type Correlation = {
  id: string;
  content: string;
  score: number;
  engagement: number;
  likes: number;
  comments: number;
  impressions: number;
};

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const HOURS = ["00h", "01h", "02h", "03h", "04h", "05h", "06h", "07h", "08h", "09h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h"];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [posts, setPosts] = useState<PostWithAnalytics[]>([]);
  const [heatmap, setHeatmap] = useState<number[][]>([]);
  const [heatmapMax, setHeatmapMax] = useState(1);
  const [correlation, setCorrelation] = useState<Correlation[]>([]);

  useEffect(() => {
    fetch(apiPath("/api/analytics"))
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setPosts(data.posts);
        setHeatmap(data.heatmap || []);
        setHeatmapMax(data.heatmapMax || 1);
        setCorrelation(data.correlation || []);
      });
  }, []);

  function heatColor(val: number) {
    if (val === 0) return "rgba(255,255,255,0.02)";
    const intensity = val / heatmapMax;
    const r = Math.round(59 + (139 - 59) * intensity);
    const g = Math.round(130 + (92 - 130) * intensity);
    const b = Math.round(246 + (246 - 246) * intensity);
    return `rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.8})`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[var(--color-accent)]" />
          Analytics
        </h1>
        <div className="flex items-center gap-2">
          <a href={apiPath("/api/analytics/export?format=csv")} download className="btn btn-ghost btn-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <Download className="h-3.5 w-3.5" /> CSV
          </a>
          <a href={apiPath("/api/analytics/export?format=json")} download className="btn btn-ghost btn-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <FileJson className="h-3.5 w-3.5" /> JSON
          </a>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Performance de tes publications LinkedIn
        </p>
      </div>

      {/* KPI Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="animate-fade-in-up stagger-1">
            <KPICard icon={BarChart3} label="Posts" value={summary.totalPosts} color="info" />
          </div>
          <div className="animate-fade-in-up stagger-2">
            <KPICard icon={Heart} label="Likes" value={summary.totalLikes} color="error" />
          </div>
          <div className="animate-fade-in-up stagger-3">
            <KPICard icon={MessageCircle} label="Commentaires" value={summary.totalComments} color="success" />
          </div>
          <div className="animate-fade-in-up stagger-4">
            <KPICard icon={RefreshCw} label="Reposts" value={summary.totalReposts} color="accent" />
          </div>
          <div className="animate-fade-in-up stagger-5">
            <KPICard icon={Eye} label="Impressions" value={summary.totalImpressions} color="warning" />
          </div>
          <div className="animate-fade-in-up stagger-5">
            <KPICard icon={TrendingUp} label="Score moy" value={summary.avgScore || "—"} color="accent" />
          </div>
        </div>
      )}

      {/* Heatmap + Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publication Heatmap */}
        <div className="animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-[var(--color-warning)]" />
            <h2 className="text-base font-semibold">Heatmap de publication</h2>
            <span className="text-xs text-[var(--color-text-muted)]">Jour × Heure</span>
          </div>
          <GlassCard padding="sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="p-0.5 text-[var(--color-text-muted)] font-normal text-left w-8"></th>
                    {Array.from({ length: 24 }, (_, h) => (
                      <th key={h} className="p-0.5 text-[var(--color-text-muted)] font-normal text-center w-7">
                        {h % 3 === 0 ? `${h}h` : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, d) => (
                    <tr key={day}>
                      <td className="p-0.5 text-[var(--color-text-muted)] text-right pr-1">{day}</td>
                      {Array.from({ length: 24 }, (_, h) => (
                        <td key={h} className="p-0">
                          <div
                            className="w-full aspect-square rounded-sm m-[1px]"
                            style={{ backgroundColor: heatColor(heatmap[d]?.[h] ?? 0) }}
                            title={`${DAYS[d]} ${h}h: ${heatmap[d]?.[h] ?? 0} engagement`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-[var(--color-text-muted)]">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />
              <span>Faible</span>
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(139, 92, 246, 0.4)" }} />
              <span>Moyen</span>
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(139, 92, 246, 0.9)" }} />
              <span>Fort</span>
            </div>
          </GlassCard>
        </div>

        {/* AI Score vs Real Engagement */}
        <div className="animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-[var(--color-accent)]" />
            <h2 className="text-base font-semibold">Score IA vs engagement réel</h2>
          </div>
          <GlassCard padding="md">
            {correlation.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-8">
                Pas encore assez de données pour la corrélation
              </p>
            ) : (
              <div className="space-y-2">
                {correlation.slice(0, 8).map((item) => {
                  const maxEng = Math.max(...correlation.map((c) => c.engagement), 1);
                  const barWidth = (item.engagement / maxEng) * 100;
                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-8 shrink-0 ${
                        item.score >= 80 ? "text-[var(--color-success)]"
                          : item.score >= 60 ? "text-[var(--color-warning)]"
                          : "text-[var(--color-error)]"
                      }`}>
                        {item.score}
                      </span>
                      <div className="flex-1 h-5 rounded-md bg-[var(--color-bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-md transition-all duration-500 flex items-center px-2"
                          style={{
                            width: `${barWidth}%`,
                            background: "linear-gradient(to right, var(--color-accent), var(--color-accent-hover))",
                          }}
                        >
                          <span className="text-[10px] text-white font-medium truncate">
                            {item.content.slice(0, 40)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)] w-12 text-right shrink-0">
                        {item.engagement}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Posts table */}
      <div className="animate-fade-in-up stagger-3">
        <GlassCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  <th className="text-left p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">Post</th>
                  <th className="text-center p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">Score</th>
                  <th className="text-center p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                    <Heart className="h-3.5 w-3.5 mx-auto" />
                  </th>
                  <th className="text-center p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                    <MessageCircle className="h-3.5 w-3.5 mx-auto" />
                  </th>
                  <th className="text-center p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                    <RefreshCw className="h-3.5 w-3.5 mx-auto" />
                  </th>
                  <th className="text-center p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                    <Eye className="h-3.5 w-3.5 mx-auto" />
                  </th>
                  <th className="text-center p-4 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4 max-w-xs">
                      <Link href={`/editor/${post.id}`} className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                        {post.content.slice(0, 60)}
                        {post.content.length > 60 ? "..." : ""}
                      </Link>
                    </td>
                    <td className="p-4 text-center">
                      {post.score ? (
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                            post.score >= 80
                              ? "bg-[var(--color-success-muted)] text-[var(--color-success)]"
                              : post.score >= 60
                                ? "bg-[var(--color-warning-muted)] text-[var(--color-warning)]"
                                : "bg-[var(--color-error-muted)] text-[var(--color-error)]"
                          }`}
                        >
                          {post.score}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-[var(--color-text-secondary)]">{post.analytics?.likes ?? "—"}</td>
                    <td className="p-4 text-center text-[var(--color-text-secondary)]">{post.analytics?.comments ?? "—"}</td>
                    <td className="p-4 text-center text-[var(--color-text-secondary)]">{post.analytics?.reposts ?? "—"}</td>
                    <td className="p-4 text-center text-[var(--color-text-secondary)]">{post.analytics?.impressions ?? "—"}</td>
                    <td className="p-4 text-center text-[var(--color-text-muted)] text-xs">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState
                        icon={BarChart3}
                        title="Aucune donnée"
                        description="Les analytics apparaîtront ici après ta première publication."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
