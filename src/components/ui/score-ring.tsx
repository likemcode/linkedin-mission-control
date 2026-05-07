"use client";

import { useEffect, useState } from "react";

type ScoreRingProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
};

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: "var(--color-success)", label: "Très bon", bg: "var(--color-success-muted)" };
  if (score >= 60) return { stroke: "var(--color-warning)", label: "À renforcer", bg: "var(--color-warning-muted)" };
  return { stroke: "var(--color-error)", label: "À retravailler", bg: "var(--color-error-muted)" };
}

export function ScoreRing({
  score,
  size = 100,
  strokeWidth = 8,
  className = "",
  showLabel = true,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const { stroke, label } = getScoreColor(score);

  useEffect(() => {
    // Animate from 0 to score
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: stroke }}>
            {animatedScore}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">/100</span>
        </div>
      </div>
      {showLabel && (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ color: stroke, backgroundColor: getScoreColor(score).bg }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
