type Status = "draft" | "scheduled" | "published" | "fresh" | "developing" | "used";

const config: Record<Status, { label: string; className: string }> = {
  draft: {
    label: "Brouillon",
    className: "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-amber-800/30",
  },
  scheduled: {
    label: "Planifié",
    className: "bg-[var(--color-info-muted)] text-[var(--color-info)] border-blue-800/30",
  },
  published: {
    label: "Publié",
    className: "bg-[var(--color-success-muted)] text-[var(--color-success)] border-emerald-800/30",
  },
  fresh: {
    label: "Nouvelle",
    className: "bg-[var(--color-success-muted)] text-[var(--color-success)] border-emerald-800/30",
  },
  developing: {
    label: "En cours",
    className: "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-amber-800/30",
  },
  used: {
    label: "Utilisée",
    className: "bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] border-gray-700/30",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const s = config[status as Status] ?? {
    label: status,
    className: "bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] border-gray-700/30",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
      {s.label}
    </span>
  );
}
