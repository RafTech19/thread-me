"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface EngagementChartProps {
  data: { date: string; likes: number; replies: number; engagement: number }[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[280px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(231, 80%, 58%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(231, 80%, 58%)" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="repliesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(180, 85%, 45%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(180, 85%, 45%)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.75rem",
              fontSize: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="likes"
            name="Likes"
            stroke="hsl(231, 80%, 58%)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#likesGradient)"
          />
          <Area
            type="monotone"
            dataKey="replies"
            name="Replies"
            stroke="hsl(180, 85%, 45%)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#repliesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

