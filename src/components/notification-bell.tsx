"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { apiPath } from "@/lib/routes";

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch(apiPath("/api/notifications"));
      const data = await res.json();
      setNotifications(data);
    } catch {}
  };

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, []);

  async function markAllRead() {
    await fetch(apiPath("/api/notifications"), { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unread > 0) markAllRead();
        }}
        className="relative p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-error)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-scale-in">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-full ml-2 bottom-0 w-80 bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl border border-[var(--color-border-subtle)] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto animate-scale-in">
            <div className="p-3 border-b border-[var(--color-border-subtle)]">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Notifications</span>
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-text-muted)] text-center">Aucune notification</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-[var(--color-border-subtle)] text-sm transition-colors ${n.read ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.02)]"}`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === "success" ? "bg-[var(--color-success)]" : n.type === "error" ? "bg-[var(--color-error)]" : "bg-[var(--color-info)]"
                      }`}
                    />
                    <div>
                      <p>{n.message}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {new Date(n.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
