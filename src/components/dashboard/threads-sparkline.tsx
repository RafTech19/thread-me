"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { SparklinePoint } from "@/lib/threads/analytics-data";

interface ThreadsSparklineProps {
  data: SparklinePoint[];
  color?: string;
  height?: number;
}

export function ThreadsSparkline({
  data,
  color = "#2563eb",
  height = 54,
}: ThreadsSparklineProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as SparklinePoint;
                return (
                  <div className="rounded-md border border-border bg-popover px-2 py-1 text-[11px] shadow-sm">
                    <span className="font-semibold text-foreground">{item.date}: </span>
                    <span className="font-mono text-primary font-bold">{item.value}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

