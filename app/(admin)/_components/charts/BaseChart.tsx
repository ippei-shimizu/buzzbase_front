"use client";

import { ResponsiveContainer } from "recharts";

interface BaseChartProps {
  children: React.ReactElement;
  height?: number;
  className?: string;
}

export default function BaseChart({
  children,
  height = 300,
  className = "",
}: BaseChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
