"use client";

type CharacterGaugeProps = {
  count: number;
};

function getZone(count: number) {
  if (count < 800) return { color: "var(--color-warning)", label: "Trop court", pct: (count / 800) * 33 };
  if (count <= 3000) return { color: "var(--color-success)", label: "Zone optimale", pct: 33 + ((count - 800) / 2200) * 34 };
  return { color: "var(--color-error)", label: "Trop long", pct: 67 + Math.min((count - 3000) / 2000, 1) * 33 };
}

export function CharacterGauge({ count }: CharacterGaugeProps) {
  const { color, label, pct } = getZone(count);
  const inIdeal = count >= 1300 && count <= 2000;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color }}>{count} chars</span>
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      </div>
      <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
        <span>800</span>
        <span className={inIdeal ? "text-[var(--color-success)] font-medium" : ""}>1300-2000 ↗</span>
        <span>3000</span>
      </div>
    </div>
  );
}
