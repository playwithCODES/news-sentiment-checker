import { GoogleGenerativeAI } from "@google/generative-ai";

function makeFallbackSummary(headline, content) {
  const cleanHeadline = headline || "This news article";
  const cleanContent = content || "";

  const sentences = cleanContent
    .replace(/\s+/g, " ")
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30);

  const firstPoint = sentences[0] || cleanHeadline;
  const secondPoint = sentences[1] || "The report highlights an important issue related to the news topic.";
  const thirdPoint = sentences[2] || "The situation may have social, economic, or public impact.";

  return `- ${firstPoint}.
- ${secondPoint}.
- ${thirdPoint}.`;
}

function cleanSummary(summary, headline, content) {
  if (Array.isArray(summary) && summary.length > 0) {
    return summary
      .map((item) => `- ${String(item).trim().replace(/^-\s?/, "")}`)
      .join("\n");
  }

  if (typeof summary === "string" && summary.trim()) {
    return summary
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `- ${line.replace(/^-\s?/, "")}`)
      .join("\n");
  }

  return makeFallbackSummary(headline, content);
}

export const analyzeWithGemini = async (headline, content) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Return ONLY valid JSON. Do not add explanation, markdown, or code fences.

You must return this exact JSON structure:
{
  "sentiment": "positive",
  "score": 0.5,
  "confidence": 0.8,
  "category": "Other",
  "positiveKeywords": ["keyword1", "keyword2"],
  "negativeKeywords": ["keyword1", "keyword2"],
  "summary": "- point one\\n- point two\\n- point three"
}

Rules:
- sentiment must be exactly one of: positive, negative, neutral
- score must be between -1 and 1
- confidence must be between 0 and 1
- category must be exactly one of:
  Politics, Economy, Technology, Health, Environment, Sports, Business, Education, Crime, Entertainment, Other
- positiveKeywords must contain 0 to 5 short keywords or phrases
- negativeKeywords must contain 0 to 5 short keywords or phrases
- summary is required
- summary must be a string, not an array
- summary must contain exactly 3 short bullet points
- each summary bullet must start with "-"
- summarize the main event, key issue, and impact
- do not write "No summary available"

Headline:
${headline}

Content:
${content}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini raw response:", text);

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("Invalid JSON from Gemini");
      }

      parsed = JSON.parse(jsonMatch[0]);
    }

    console.log("Parsed Gemini Response:", parsed);

    const cleanSentiment = String(parsed.sentiment || "")
      .toLowerCase()
      .trim();

    let score = Number(parsed.score);
    let confidence = Number(parsed.confidence);

    if (Number.isNaN(score)) score = 0;
    if (Number.isNaN(confidence)) confidence = 0.5;

    score = Math.max(-1, Math.min(1, score));
    confidence = Math.max(0, Math.min(1, confidence));

    const allowedCategories = [
      "Politics",
      "Economy",
      "Technology",
      "Health",
      "Environment",
      "Sports",
      "Business",
      "Education",
      "Crime",
      "Entertainment",
      "Other",
    ];

    const cleanCategory = String(parsed.category || "").trim();

    const finalCategory = allowedCategories.includes(cleanCategory)
      ? cleanCategory
      : "Other";

    const finalSummary = cleanSummary(parsed.summary, headline, content);

    return {
      sentiment: ["positive", "negative", "neutral"].includes(cleanSentiment)
        ? cleanSentiment
        : "neutral",

      score,

      confidence,

      category: finalCategory,

      positiveKeywords: Array.isArray(parsed.positiveKeywords)
        ? parsed.positiveKeywords
            .map((keyword) => String(keyword).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],

      negativeKeywords: Array.isArray(parsed.negativeKeywords)
        ? parsed.negativeKeywords
            .map((keyword) => String(keyword).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],

      summary: finalSummary,
    };
  } catch (error) {
    console.error("Gemini Error FULL:", error);
    throw error;
  }
};