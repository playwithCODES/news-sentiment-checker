import { GoogleGenerativeAI } from "@google/generative-ai";
export const analyzeWithGemini = async (headline, content) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Return ONLY valid JSON. Do not add explanation, markdown, or code fences.

Format:
{
  "sentiment": "positive|negative|neutral",
  "score": number,
  "confidence": number,
  "category": "Politics|Economy|Technology|Health|Environment|Sports|Business|Education|Crime|Entertainment|Other",
  "positiveKeywords": ["word1", "word2"],
  "negativeKeywords": ["word1", "word2"],
  "summary": "short summary in bullet points"
}

Rules:
- sentiment must be exactly one of: positive, negative, neutral
- no extra spaces in sentiment
- score must be between -1 and 1
- score should reflect the overall tone precisely
- use decimal values like -0.8, -0.3, 0, 0.4, 0.9
- confidence must be between 0 and 1
- category must be exactly one from the list above
- positiveKeywords and negativeKeywords should contain 0 to 5 short keywords or short phrases
- summary must be short and in bullet points

Headline: ${headline}
Content: ${content}
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

    const cleanSentiment = String(parsed.sentiment || "").toLowerCase().trim();

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
      "Other"
    ];

    const cleanCategory = String(parsed.category || "").trim();
    const finalCategory = allowedCategories.includes(cleanCategory)
      ? cleanCategory
      : "Other";

    // Clean up the summary
    const summary = typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim().split('\n').map(line => `- ${line.trim().replace(/^-\s?/, '')}`).join('\n')
      : "No summary available";

    console.log("Summary in parsed response:", summary);

    return {
      sentiment: ["positive", "negative", "neutral"].includes(cleanSentiment)
        ? cleanSentiment
        : "neutral",
      score,
      confidence,
      category: finalCategory,
      positiveKeywords: Array.isArray(parsed.positiveKeywords)
        ? parsed.positiveKeywords
            .map((k) => String(k).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],
      negativeKeywords: Array.isArray(parsed.negativeKeywords)
        ? parsed.negativeKeywords
            .map((k) => String(k).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],
      summary: parsed.summary || "No summary available"
    };
  } catch (error) {
    console.error("Gemini Error FULL:", error);
    throw error;
  }
};