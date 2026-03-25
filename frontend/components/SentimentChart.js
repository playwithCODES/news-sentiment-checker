"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SentimentChart({ stats }) {
  const data = [
    { name: "Positive", value: stats.Positive || 0 },
    { name: "Negative", value: stats.Negative || 0 },
    { name: "Neutral", value: stats.Neutral || 0 }
  ];

  return (
    <div className="card rounded-2xl p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Sentiment Summary</h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}