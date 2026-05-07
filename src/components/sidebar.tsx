"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Lightbulb,
  Layers,
  Zap,
  BookTemplate,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { useProfile } from "@/components/profile-provider";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/editor", icon: PenSquare, label: "Nouveau post" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/ideas", icon: Lightbulb, label: "Idées" },
  { href: "/series", icon: Layers, label: "Séries" },
  { href: "/batch", icon: Zap, label: "Batch" },
  { href: "/templates", icon: BookTemplate, label: "Templates" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, loading } = useProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Normalize pathname: remove basePath "/linkedin" prefix for matching
  const normalizedPath = pathname.replace(/^\/linkedin/, "") || "/";

  function isActive(href: string) {
    if (href === "/") return normalizedPath === "/";
    return normalizedPath.startsWith(href);
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden btn btn-ghost p-2"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl
          border-r border-[var(--color-border-subtle)]
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className={`flex items-center h-14 border-b border-[var(--color-border-subtle)] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-7 w-7 rounded-lg gradient-accent flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-bold text-sm gradient-accent-text">Mission Control</span>
            </Link>
          )}
          {collapsed && (
            <div className="h-7 w-7 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative group
                  ${active
                    ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)] transition-all" />
                )}
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[var(--color-accent)]" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-[var(--color-border-subtle)] space-y-1">
          {/* Notifications */}
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
            <NotificationBell />
            {!collapsed && <span className="text-sm text-[var(--color-text-secondary)]">Notifications</span>}
          </div>

          {/* User Profile */}
          <div className={`flex items-center gap-3 px-3 py-3 mt-2 mb-1 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)] ${collapsed ? "justify-center px-1" : ""}`}>
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-[var(--color-bg-tertiary)] animate-pulse shrink-0" />
            ) : profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="h-8 w-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {profile?.firstName ? profile.firstName[0] : "J"}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {loading ? "Chargement..." : profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}` : "Utilisateur"}
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
