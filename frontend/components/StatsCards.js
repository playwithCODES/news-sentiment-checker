export default function StatsCards({ stats }) {
  const items = [
    { label: "Total", value: stats.total || 0 },
    { label: "Positive", value: stats.Positive || 0 },
    { label: "Negative", value: stats.Negative || 0 },
    { label: "Neutral", value: stats.Neutral || 0 }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-500">{item.label}</p>
          <h3 className="mt-2 text-3xl font-bold">{item.value}</h3>
        </div>
      ))}
    </div>
  );
}