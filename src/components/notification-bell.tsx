"use client";

import { useEffect, useState } from "react";

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
      const res = await fetch("/api/notifications");
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
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unread > 0) markAllRead();
        }}
        className="relative p-2 hover:text-blue-400 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">Aucune notification</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-gray-800 text-sm ${n.read ? "text-gray-500" : "text-gray-200"}`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    n.type === "success" ? "bg-green-400" : n.type === "error" ? "bg-red-400" : "bg-blue-400"
                  }`}
                />
                {n.message}
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(n.createdAt).toLocaleString("fr-FR")}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
