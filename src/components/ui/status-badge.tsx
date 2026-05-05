type Status = "draft" | "scheduled" | "published" | "publishing" | "failed" | "fresh" | "developing" | "used";

const config: Record<Status, { label: string; className: string }> = {
  draft:    { label: "Brouillon",  className: "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/20" },
  scheduled:{ label: "Planifié",  className: "bg-[var(--color-info-muted)] text-[var(--color-info)] border-[var(--color-info)]/20" },
  published:{ label: "Publié",    className: "bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]/20" },
  publishing:{ label: "Publication", className: "bg-[var(--color-info-muted)] text-[var(--color-info)] border-[var(--color-info)]/20" },
  failed:   { label: "Échec",      className: "bg-[var(--color-error-muted)] text-[var(--color-error)] border-[var(--color-error)]/20" },
  fresh:    { label: "Nouvelle",  className: "bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]/20" },
  developing:{ label: "En cours", className: "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/20" },
  used:     { label: "Utilisée",  className: "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border-default)]" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = config[status as Status] ?? {
    label: status,
    className: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
      {s.label}
    </span>
  );
}
