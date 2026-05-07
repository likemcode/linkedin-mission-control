import { type ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  children,
  className = "",
  interactive = false,
  padding = "md",
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${interactive ? "glass-card-interactive cursor-pointer" : ""} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
