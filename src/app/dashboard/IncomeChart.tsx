"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface IncomeChartProps {
  data: { month: string; income: number }[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-neutral-400 font-medium">
        No payment data available yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#525252", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#525252", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, "Income"]}
            contentStyle={{ backgroundColor: "#000000", border: "none", borderRadius: "10px", color: "#FFF" }}
            itemStyle={{ color: "#FFFFFF" }}
          />
          <Bar dataKey="income" fill="#000000" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
