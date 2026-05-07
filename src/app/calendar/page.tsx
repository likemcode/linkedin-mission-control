"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";

type Post = {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
};

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (Date | null)[] = [];
  // Fill blanks before first day
  for (let i = 0; i < startDow; i++) days.push(null);
  // Fill actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  // Fill rest of last week
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);
  const today = new Date();

  useEffect(() => {
    setLoading(true);
    fetch(apiPath("/api/posts"))
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  function getPostDate(post: Post): Date | null {
    if (post.scheduledAt) return new Date(post.scheduledAt);
    if (post.publishedAt) return new Date(post.publishedAt);
    return null;
  }

  function getPostsForDay(day: Date) {
    return posts.filter((p) => {
      const d = getPostDate(p);
      return d && isSameDay(d, day);
    });
  }

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  const statusDot: Record<string, string> = {
    published: "bg-[var(--color-success)]",
    scheduled: "bg-[var(--color-info)]",
    draft: "bg-[var(--color-warning)]",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-[var(--color-accent)]" />
          Calendrier
        </h1>
        <Link href="/editor">
          <GradientButton variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Planifier
          </GradientButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 animate-fade-in-up stagger-1">
          <GlassCard padding="md">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="btn btn-ghost p-2">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {MONTHS_FR[month]} {year}
              </h2>
              <button onClick={nextMonth} className="btn btn-ghost p-2">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS_FR.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-[var(--color-text-muted)] py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) {
                  return <div key={`blank-${i}`} className="aspect-square" />;
                }

                const dayPosts = getPostsForDay(day);
                const isToday = isSameDay(day, today);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentMonth = day.getMonth() === month;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start gap-1 transition-all text-sm relative
                      ${isSelected
                        ? "bg-[var(--color-accent-muted)] border border-[var(--color-accent-border)]"
                        : "hover:bg-[rgba(255,255,255,0.04)] border border-transparent"
                      }
                      ${!isCurrentMonth ? "opacity-30" : ""}
                    `}
                  >
                    <span className={`text-xs font-medium leading-none mt-1
                      ${isToday ? "bg-[var(--color-accent)] text-white w-5 h-5 rounded-full flex items-center justify-center" : ""}
                      ${isSelected && !isToday ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}
                    `}>
                      {day.getDate()}
                    </span>
                    {dayPosts.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {dayPosts.slice(0, 3).map((p) => (
                          <span
                            key={p.id}
                            className={`w-1.5 h-1.5 rounded-full ${statusDot[p.status] ?? statusDot.draft}`}
                          />
                        ))}
                        {dayPosts.length > 3 && (
                          <span className="text-[8px] text-[var(--color-text-muted)]">+{dayPosts.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Publié</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-info)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Planifié</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Brouillon</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Day detail panel */}
        <div className="animate-fade-in-up stagger-2">
          <GlassCard padding="md">
            {selectedDay ? (
              <>
                <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">
                  {selectedDay.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                {selectedDayPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[var(--color-text-muted)] mb-3">Aucun post ce jour</p>
                    <Link href="/editor">
                      <GradientButton variant="secondary" size="sm">
                        <Plus className="h-3 w-3" />
                        Créer un post
                      </GradientButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayPosts.map((post) => (
                      <Link key={post.id} href={`/editor/${post.id}`}>
                        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] transition-all group">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={post.status} />
                            {post.scheduledAt && (
                              <span className="text-xs text-[var(--color-text-muted)]">
                                {new Date(post.scheduledAt).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 group-hover:text-[var(--color-text-primary)] transition-colors">
                            {post.content.slice(0, 150) || "Post vide"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--color-text-muted)]">
                  Sélectionne un jour pour voir les posts
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
