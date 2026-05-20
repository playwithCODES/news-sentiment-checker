import Sentiment from "sentiment";

const sentiment = new Sentiment();

const positiveWordList = [
  "good",
  "great",
  "excellent",
  "growth",
  "success",
  "benefit",
  "improve",
  "improved",
  "positive",
  "win",
  "strong",
  "safe",
  "hope",
  "achievement",
  "progress",
  "profit",
  "record",
  "recover",
  "boost",
  "support",
];

const negativeWordList = [
  "bad",
  "poor",
  "loss",
  "decline",
  "fraud",
  "crisis",
  "negative",
  "risk",
  "danger",
  "weak",
  "corruption",
  "fail",
  "failure",
  "violence",
  "problem",
  "drop",
  "flood",
  "flooding",
  "disaster",
  "death",
  "damage",
  "displaced",
  "critical",
  "injury",
  "destroyed",
  "attack",
  "war",
  "accident",
  "protest",
];

function extractKeywords(text, list) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];

  return [...new Set(words.filter((word) => list.includes(word)))].slice(0, 5);
}

function detectCategory(text) {
  const t = text.toLowerCase();

  if (
    t.includes("election") ||
    t.includes("government") ||
    t.includes("minister") ||
    t.includes("parliament") ||
    t.includes("president") ||
    t.includes("politics")
  ) {
    return "Politics";
  }

  if (
    t.includes("economy") ||
    t.includes("inflation") ||
    t.includes("gdp") ||
    t.includes("budget") ||
    t.includes("tax")
  ) {
    return "Economy";
  }

  if (
    t.includes("market") ||
    t.includes("stock") ||
    t.includes("business") ||
    t.includes("bank") ||
    t.includes("company")
  ) {
    return "Business";
  }

  if (
    t.includes("ai") ||
    t.includes("technology") ||
    t.includes("software") ||
    t.includes("startup") ||
    t.includes("internet") ||
    t.includes("cyber")
  ) {
    return "Technology";
  }

  if (
    t.includes("health") ||
    t.includes("hospital") ||
    t.includes("doctor") ||
    t.includes("disease") ||
    t.includes("medicine")
  ) {
    return "Health";
  }

  if (
    t.includes("climate") ||
    t.includes("environment") ||
    t.includes("pollution") ||
    t.includes("flood") ||
    t.includes("forest")
  ) {
    return "Environment";
  }

  if (
    t.includes("match") ||
    t.includes("football") ||
    t.includes("cricket") ||
    t.includes("tournament") ||
    t.includes("player")
  ) {
    return "Sports";
  }

  if (
    t.includes("school") ||
    t.includes("college") ||
    t.includes("student") ||
    t.includes("education") ||
    t.includes("university")
  ) {
    return "Education";
  }

  if (
    t.includes("crime") ||
    t.includes("murder") ||
    t.includes("police") ||
    t.includes("arrest") ||
    t.includes("theft")
  ) {
    return "Crime";
  }

  if (
    t.includes("movie") ||
    t.includes("music") ||
    t.includes("celebrity") ||
    t.includes("film") ||
    t.includes("entertainment")
  ) {
    return "Entertainment";
  }

  return "Other";
}

function createSummary(headline, content, sentimentLabel, category) {
  const shortContent =
    content.length > 180 ? `${content.slice(0, 180)}...` : content;

  return `- Category: ${category}
- Sentiment: ${sentimentLabel}
- News overview: ${shortContent || headline}`;
}

export function analyzeNews(headline, content) {
  const fullText = `${headline || ""} ${content || ""}`.trim();

  const result = sentiment.analyze(fullText);

  let sentimentLabel = "neutral";

  if (result.score > 1) {
    sentimentLabel = "positive";
  } else if (result.score < -1) {
    sentimentLabel = "negative";
  }

  const category = detectCategory(fullText);

  const positiveKeywords = extractKeywords(fullText, positiveWordList);
  const negativeKeywords = extractKeywords(fullText, negativeWordList);

  const normalizedScore = Math.max(
    -1,
    Math.min(1, result.comparative || result.score / 10 || 0)
  );

  const confidence = Math.max(
    0.5,
    Math.min(0.95, Math.abs(normalizedScore) + 0.5)
  );

  return {
    sentiment: sentimentLabel,
    score: normalizedScore,
    confidence,
    category,
    positiveKeywords,
    negativeKeywords,
    summary: createSummary(headline, content, sentimentLabel, category),
  };
}