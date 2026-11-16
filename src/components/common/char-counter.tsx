import React from "react";
import { cn } from "@/lib/utils";

interface CharCounterProps {
  current: number;
  max?: number;
  className?: string;
}

export function CharCounter({
  current,
  max = 500,
  className,
}: CharCounterProps) {
  const remaining = max - current;
  const isNearLimit = remaining <= 50 && remaining >= 0;
  const isOverLimit = remaining < 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs tabular-nums select-none",
        isOverLimit
          ? "font-semibold text-destructive"
          : isNearLimit
          ? "font-medium text-warning"
          : "text-muted-foreground",
        className
      )}
    >
      <span>
        {current}/{max}
      </span>
      {isOverLimit && (
        <span className="text-[10px] font-semibold">
          (Lebih {Math.abs(remaining)} karakter)
        </span>
      )}
    </div>
  );
}

