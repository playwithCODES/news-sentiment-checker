"use client";

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

  const sentiment = String(result.sentiment || "neutral").toLowerCase();

  const badgeColor =
    sentiment === "positive"
      ? "bg-green-100 text-green-700"
      : sentiment === "negative"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  const positiveKeywords =
    result.positiveKeywords && result.positiveKeywords.length > 0
      ? result.positiveKeywords.join(", ")
      : "None";

  const negativeKeywords =
    result.negativeKeywords && result.negativeKeywords.length > 0
      ? result.negativeKeywords.join(", ")
      : "None";

  return (
    <div className="card rounded-2xl p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Latest Result</h2>

      <div className="space-y-3">
        <p>
          <span className="font-semibold">Headline:</span>{" "}
          {result.headline || "No headline available"}
        </p>

        <p>
          <span className="font-semibold">Sentiment:</span>{" "}
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${badgeColor}`}
          >
            {sentiment}
          </span>
        </p>

        <p>
          <span className="font-semibold">Category:</span>{" "}
          {result.category || "Other"}
        </p>

        <p>
          <span className="font-semibold">Score:</span>{" "}
          {result.score ?? 0}
        </p>

        <p>
          <span className="font-semibold">Confidence:</span>{" "}
          {result.confidence ?? 0.5}
        </p>

        <p>
          <span className="font-semibold">Source Type:</span>{" "}
          {result.sourceType || "manual"}
        </p>

        {result.usedAnalyzer && (
          <p>
            <span className="font-semibold">Analyzer:</span>{" "}
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {result.usedAnalyzer === "gemini"
                ? "Gemini API"
                : "Local Fallback"}
            </span>
          </p>
        )}

        <p>
          <span className="font-semibold">Positive Keywords:</span>{" "}
          {positiveKeywords}
        </p>

        <p>
          <span className="font-semibold">Negative Keywords:</span>{" "}
          {negativeKeywords}
        </p>

        <div className="mt-5">
          <h3 className="mb-2 text-lg font-semibold">Summary</h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
            {result.summary || "No summary available"}
          </div>
        </div>
      </div>
    </div>
  );
}