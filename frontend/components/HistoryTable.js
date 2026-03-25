"use client";

export default function HistoryTable({ analyses }) {
  return (
    <div className="card rounded-2xl p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Analysis History</h2>

      {analyses.length === 0 ? (
        <p className="text-slate-500">No analysis history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Headline</th>
                <th className="p-3">Category</th>
                <th className="p-3">Sentiment</th>
                <th className="p-3">Score</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Source</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {analyses.map((item) => (
                <tr key={item._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-3">{item.headline}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.sentiment}</td>
                  <td className="p-3">{item.score}</td>
                  <td className="p-3">{item.confidence}%</td>
                  <td className="p-3">{item.sourceType}</td>
                  <td className="p-3">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}