import { type ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = {
  none: "surface-p-none",
  sm: "surface-p-sm",
  md: "surface-p-md",
  lg: "surface-p-lg",
};

export function GlassCard({
  children,
  className = "",
  interactive = false,
  padding = "md",
}: SurfaceProps) {
  return (
    <div
      className={`surface ${interactive ? "surface-interactive" : ""} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
