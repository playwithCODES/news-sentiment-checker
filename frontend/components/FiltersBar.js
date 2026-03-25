"use client";

export default function FiltersBar({ filters, setFilters, onExportCsv, onExportPdf }) {
  return (
    <div className="card grid gap-4 rounded-2xl p-4 shadow md:grid-cols-4">
      <input
        type="text"
        placeholder="Search headline/category"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      <select
        value={filters.sentiment}
        onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
      >
        <option value="">All Sentiments</option>
        <option value="Positive">Positive</option>
        <option value="Negative">Negative</option>
        <option value="Neutral">Neutral</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="Politics">Politics</option>
        <option value="Sports">Sports</option>
        <option value="Business">Business</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Technology">Technology</option>
        <option value="General">General</option>
      </select>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}