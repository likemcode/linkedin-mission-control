type SkeletonProps = {
  className?: string;
  variant?: "text" | "card" | "circle" | "rect";
};

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const base = "animate-shimmer rounded bg-[rgba(255,255,255,0.04)]";

  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-2xl",
    circle: "h-10 w-10 rounded-full",
    rect: "h-20 w-full rounded-xl",
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
}

export function SkeletonGroup({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rect" className={`stagger-${i + 1}`} />
      ))}
    </div>
  );
}
