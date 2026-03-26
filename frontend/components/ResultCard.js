export default function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="card rounded-2xl p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Latest Result</h2>
        <p className="text-slate-500">
          No recent result yet. Analyze a news article to see the output.
        </p>
      </div>
    );
  }

  const badgeColor =
    result.sentiment === "Positive"
      ? "bg-green-100 text-green-700"
      : result.sentiment === "Negative"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="card rounded-2xl p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Latest Result</h2>

      <div className="space-y-3">
        <p>
          <span className="font-semibold">Headline:</span> {result.headline}
        </p>

        <p>
          <span className="font-semibold">Sentiment:</span>{" "}
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${badgeColor}`}>
            {result.sentiment}
          </span>
        </p>

        <p>
          <span className="font-semibold">Category:</span> {result.category}
        </p>

        <p>
          <span className="font-semibold">Score:</span> {result.score}
        </p>

        <p>
          <span className="font-semibold">Confidence:</span> {result.confidence}
        </p>

        <p>
          <span className="font-semibold">Source Type:</span> {result.sourceType}
        </p>

        <p>
          <span className="font-semibold">Positive Keywords:</span>{" "}
          {result.positiveKeywords?.join(", ") || "None"}
        </p>

        <p>
          <span className="font-semibold">Negative Keywords:</span>{" "}
          {result.negativeKeywords?.join(", ") || "None"}
        </p>
      </div>
    </div>
  );
}