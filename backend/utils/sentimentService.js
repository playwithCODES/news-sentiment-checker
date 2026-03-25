import Sentiment from "sentiment";
const sentiment = new Sentiment();

const positiveWordList = [
  "good", "great", "excellent", "growth", "success",
  "benefit", "improve", "improved", "positive", "win",
  "strong", "safe", "hope", "achievement", "progress"
];

const negativeWordList = [
  "bad", "poor", "loss", "decline", "fraud",
  "crisis", "negative", "risk", "danger", "weak",
  "corruption", "fail", "failure", "violence", "problem", "drop", "flood",
  "flooding",
  "disaster",
  "death",
  "damage",
  "crisis",
  "loss",
  "risk",
  "danger",
  "displaced",
  "critical",
  "injury",
  "destroyed"
];

function extractKeywords(text, list) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  return [...new Set(words.filter((word) => list.includes(word)))];
}

function detectCategory(text) {
  const t = text.toLowerCase();

  if (t.includes("election") || t.includes("government") || t.includes("minister") || t.includes("parliament")) {
    return "Politics";
  }

  if (t.includes("match") || t.includes("football") || t.includes("cricket") || t.includes("tournament")) {
    return "Sports";
  }

  if (t.includes("market") || t.includes("stock") || t.includes("business") || t.includes("bank")) {
    return "Business";
  }

  if (t.includes("movie") || t.includes("music") || t.includes("celebrity") || t.includes("film")) {
    return "Entertainment";
  }

  if (t.includes("ai") || t.includes("technology") || t.includes("software") || t.includes("startup")) {
    return "Technology";
  }

  return "General";
}

export function analyzeNews(headline, content) {
  const fullText = `${headline} ${content}`.trim();
  const result = sentiment.analyze(fullText);

  let label = "Neutral";
  if (result.score > 1) label = "Positive";
  else if (result.score < -1) label = "Negative";

  const confidence = Math.min(100, Math.max(50, Math.abs(result.score) * 12 + 50));

  const positiveKeywords = extractKeywords(fullText, positiveWordList);
  const negativeKeywords = extractKeywords(fullText, negativeWordList);
  const category = detectCategory(fullText);

  return {
    sentiment: label,
    score: result.score,
    comparative: result.comparative,
    confidence,
    positiveKeywords,
    negativeKeywords,
    category
  };
}