import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeWithGemini = async (headline, content) => {
  try {
    const prompt = `
Analyze this news and return ONLY valid JSON.

{
  "sentiment": "Positive | Negative | Neutral",
  "category": "General | Technology | Politics | Economy | Others",
  "score": 1,
  "confidence": 0,
  "positiveKeywords": [],
  "negativeKeywords": []
}

Headline: ${headline}
Content: ${content}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.log("Gemini Error FULL:", error);
    throw new Error("AI analysis failed");
  }
};