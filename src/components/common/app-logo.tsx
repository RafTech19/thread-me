import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export function AppLogo({
  size = "md",
  className,
  showText = true,
  subtitle,
}: AppLogoProps) {
  const sizeMap = {
    sm: { px: 28, class: "h-7 w-7" },
    md: { px: 36, class: "h-9 w-9" },
    lg: { px: 48, class: "h-12 w-12" },
    xl: { px: 64, class: "h-16 w-16" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl shadow-xs transition-transform hover:scale-105",
          currentSize.class
        )}
      >
        <Image
          src="/logo.png"
          alt="ThreadMe Logo"
          width={currentSize.px}
          height={currentSize.px}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            ThreadMe
          </span>
          {subtitle && (
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

