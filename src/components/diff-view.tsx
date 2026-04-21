"use client";

import { useMemo } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

type DiffViewProps = {
  oldText: string;
  newText: string;
  onUndo: () => void;
};

function computeDiff(oldText: string, newText: string) {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const result: { text: string; type: "added" | "removed" | "same" }[] = [];

  let oi = 0, ni = 0;
  while (oi < oldWords.length || ni < newWords.length) {
    if (oi >= oldWords.length) {
      result.push({ text: newWords[ni], type: "added" });
      ni++;
    } else if (ni >= newWords.length) {
      result.push({ text: oldWords[oi], type: "removed" });
      oi++;
    } else if (oldWords[oi] === newWords[ni]) {
      result.push({ text: oldWords[oi], type: "same" });
      oi++; ni++;
    } else {
      // Simple word-level diff: show removed then added
      result.push({ text: oldWords[oi], type: "removed" });
      oi++;
      result.push({ text: newWords[ni], type: "added" });
      ni++;
    }
  }

  return result;
}

export function DiffView({ oldText, newText, onUndo }: DiffViewProps) {
  const diff = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);

  return (
    <div className="animate-scale-in bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-error)]/40" />
            <span className="text-[var(--color-text-muted)]">Retiré</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-success)]/40" />
            <span className="text-[var(--color-text-muted)]">Ajouté</span>
          </div>
        </div>
        <button onClick={onUndo} className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors py-1 px-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
          <RotateCcw className="h-3 w-3" /> Annuler
        </button>
      </div>
      <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
        {diff.map((part, i) => {
          if (part.type === "added") {
            return <span key={i} className="bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-sm">{part.text}</span>;
          }
          if (part.type === "removed") {
            return <span key={i} className="bg-[var(--color-error)]/20 text-[var(--color-error)]/70 line-through rounded-sm">{part.text}</span>;
          }
          return <span key={i}>{part.text}</span>;
        })}
      </div>
    </div>
  );
}
