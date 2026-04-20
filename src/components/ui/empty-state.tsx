import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="h-16 w-16 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-[var(--color-accent)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
