import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/lib/../components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  comparisonText?: string;
  icon: React.ReactNode;
  iconBgClass?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  changePercent,
  comparisonText,
  icon,
  iconBgClass = "bg-primary-soft text-primary",
  className,
}: StatCardProps) {
  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
              iconBgClass
            )}
          >
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
            {value}
          </span>
          {changePercent !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold select-none",
                isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(changePercent)}%
            </span>
          )}
        </div>

        {comparisonText && (
          <p className="mt-2 text-xs text-muted-foreground">
            {comparisonText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

