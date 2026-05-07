import { type LucideIcon } from "lucide-react";

type KPICardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: "accent" | "success" | "warning" | "error" | "info";
  className?: string;
};

const colorMap = {
  accent: {
    icon: "text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-muted)]",
    value: "text-[var(--color-accent-hover)]",
  },
  success: {
    icon: "text-[var(--color-success)]",
    bg: "bg-[var(--color-success-muted)]",
    value: "text-[var(--color-success)]",
  },
  warning: {
    icon: "text-[var(--color-warning)]",
    bg: "bg-[var(--color-warning-muted)]",
    value: "text-[var(--color-warning)]",
  },
  error: {
    icon: "text-[var(--color-error)]",
    bg: "bg-[var(--color-error-muted)]",
    value: "text-[var(--color-error)]",
  },
  info: {
    icon: "text-[var(--color-info)]",
    bg: "bg-[var(--color-info-muted)]",
    value: "text-[var(--color-info)]",
  },
};

export function KPICard({ icon: Icon, label, value, color, className = "" }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        <div className="min-w-0">
          <div className={`text-2xl font-bold ${c.value} leading-tight`}>{value}</div>
          <div className="text-xs text-[var(--color-text-muted)] truncate">{label}</div>
        </div>
      </div>
    </div>
  );
}
