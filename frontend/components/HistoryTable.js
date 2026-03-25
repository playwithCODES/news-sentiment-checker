"use client";

import api from "@/lib/api";

export default function HistoryTable({ analyses, setAnalyses }) {
  const handleDelete = async (id) => {
  const confirmDelete = confirm("Are you sure you want to delete this analysis?");
  if (!confirmDelete) return;

  try {
    await api.delete(`/analysis/${id}`);
    setAnalyses((prev) => prev.filter((item) => item._id !== id));
  } catch (error) {
    console.error(error);
  }
};

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
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {analyses.map((item) => (
                <tr
                  key={item._id}
            className="border-b"
                >
                  <td className="p-3">{item.headline}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.sentiment}</td>
                  <td className="p-3">{item.score}</td>
                  <td className="p-3">{item.confidence}%</td>
                  <td className="p-3">{item.sourceType}</td>
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}