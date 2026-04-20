"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
};

type ToastContextValue = {
  toast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-[var(--color-success)] shrink-0" />,
  error: <AlertCircle className="h-4 w-4 text-[var(--color-error)] shrink-0" />,
  info: <Info className="h-4 w-4 text-[var(--color-info)] shrink-0" />,
  warning: <AlertCircle className="h-4 w-4 text-[var(--color-warning)] shrink-0" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-[var(--color-success)]/30",
  error: "border-[var(--color-error)]/30",
  info: "border-[var(--color-info)]/30",
  warning: "border-[var(--color-warning)]/30",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${t.exiting ? "animate-toast-out" : "animate-toast-in"} flex items-start gap-3 rounded-xl border ${borderColors[t.type]} bg-[var(--color-bg-secondary)]/95 backdrop-blur-lg px-4 py-3 shadow-lg`}
          >
            {icons[t.type]}
            <p className="text-sm text-[var(--color-text-primary)] flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
