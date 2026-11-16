"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const tokenUsageData = [
  { date: "06 Nov", tokens: 4200 },
  { date: "07 Nov", tokens: 5800 },
  { date: "08 Nov", tokens: 9100 },
  { date: "09 Nov", tokens: 3400 },
  { date: "10 Nov", tokens: 8200 },
  { date: "11 Nov", tokens: 6100 },
  { date: "12 Nov", tokens: 4430 },
];

export function DailyTokenChart() {
  return (
    <div className="h-[260px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={tokenUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            cursor={{ fill: "hsl(var(--muted)/0.5)" }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.75rem",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="tokens"
            name="Token Terpakai"
            fill="hsl(231, 80%, 58%)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

