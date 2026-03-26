"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SentimentChart({ stats }) {
  const data = [
    { name: "Positive", value: stats.Positive || 0, color: "#22c55e" },
    { name: "Negative", value: stats.Negative || 0, color: "#ef4444" },
    { name: "Neutral", value: stats.Neutral || 0, color: "#6b7280" },
  ];

  return (
    <div className="card rounded-2xl p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Sentiment Summary</h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value, name, props) => [value, props.payload.name]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}