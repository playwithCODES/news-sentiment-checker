import axios from "axios";
import * as cheerio from "cheerio";
import PDFDocument from "pdfkit";
import Analysis from "../models/Analysis.js";
import { analyzeWithGemini } from "../utils/geminiService.js";
import { analyzeNews } from "../utils/sentimentservice.js";

// Extract article headline and content from URL
async function extractArticleFromUrl(url) {
  try {
    if (!url) {
      throw new Error("Source URL is required");
    }

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(response.data);

    const title =
      $("meta[property='og:title']").attr("content")?.trim() ||
      $("meta[name='twitter:title']").attr("content")?.trim() ||
      $("h1").first().text().trim() ||
      $("title").first().text().trim() ||
      "Untitled News";

    const paragraphs = [];

    $("article p, main p, p").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();

      if (
        text.length > 40 &&
        !text.toLowerCase().includes("subscribe") &&
        !text.toLowerCase().includes("advertisement") &&
        !text.toLowerCase().includes("cookie")
      ) {
        paragraphs.push(text);
      }
    });

    const content = paragraphs.join(" ").slice(0, 5000);

    if (!content || content.length < 50) {
      throw new Error("Could not extract enough article content from this URL");
    }

    return {
      headline: title,
      content,
    };
  } catch (error) {
    console.error("URL EXTRACT ERROR:", error.message);
    throw new Error(
      error.message || "Failed to extract article content from URL"
    );
  }
}

// Clean and normalize analysis result before saving to MongoDB
function normalizeAnalysisResult(result) {
  const allowedSentiments = ["positive", "negative", "neutral"];

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

  const sentiment = String(result?.sentiment || "neutral")
    .toLowerCase()
    .trim();

  const category = String(result?.category || "Other").trim();

  let score = Number(result?.score);
  let confidence = Number(result?.confidence);

  if (Number.isNaN(score)) score = 0;
  if (Number.isNaN(confidence)) confidence = 0.5;

  score = Math.max(-1, Math.min(1, score));
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    sentiment: allowedSentiments.includes(sentiment) ? sentiment : "neutral",
    score,
    confidence,
    category: allowedCategories.includes(category) ? category : "Other",
    positiveKeywords: Array.isArray(result?.positiveKeywords)
      ? result.positiveKeywords.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
      : [],
    negativeKeywords: Array.isArray(result?.negativeKeywords)
      ? result.negativeKeywords.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
      : [],
    summary:
      typeof result?.summary === "string" && result.summary.trim()
        ? result.summary.trim()
        : "No summary available",
  };
}

// Create new analysis
const createAnalysis = async (req, res) => {
  try {
    let { headline, content, sourceUrl } = req.body;

    headline = headline?.trim();
    content = content?.trim();
    sourceUrl = sourceUrl?.trim();

    let sourceType = "manual";

    // If user provides URL and does not provide headline/content, scrape from URL
    if (sourceUrl && (!headline || !content)) {
      const scraped = await extractArticleFromUrl(sourceUrl);

      headline = headline || scraped.headline;
      content = content || scraped.content;
      sourceType = "url";
    }

    if (!headline || !content) {
      return res.status(400).json({
        message:
          "Headline and content are required, or provide a valid source URL",
      });
    }

    let rawResult;
    let usedAnalyzer = "gemini";

    // First try Gemini API
    try {
      rawResult = await analyzeWithGemini(headline, content);
      usedAnalyzer = "gemini";
      console.log("Analysis completed using Gemini API");
    } catch (geminiError) {
      console.log("Gemini failed. Using local fallback sentiment analysis.");
      console.log("Gemini Error:", geminiError.message);

      // Fallback to local sentiment service
      rawResult = analyzeNews(headline, content);
      usedAnalyzer = "local";
    }

    const result = normalizeAnalysisResult(rawResult);

    const analysis = await Analysis.create({
      userId: req.user.id,
      headline,
      content,
      sourceUrl: sourceUrl || "",
      category: result.category,
      sentiment: result.sentiment,
      score: result.score,
      confidence: result.confidence,
      positiveKeywords: result.positiveKeywords,
      negativeKeywords: result.negativeKeywords,
      summary: result.summary,
      sourceType,
    });

    res.status(201).json({
      ...analysis.toObject(),
      usedAnalyzer,
    });
  } catch (error) {
    console.error("CREATE ANALYSIS ERROR:", error);

    res.status(500).json({
      message: error.message || "Analysis failed",
    });
  }
};

// Get logged-in user's analyses
const getMyAnalyses = async (req, res) => {
  try {
    const { search = "", sentiment = "", category = "" } = req.query;

    const query = {
      userId: req.user.id,
    };

    if (search) {
      query.$or = [
        {
          headline: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          content: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (sentiment) {
      query.sentiment = sentiment.toLowerCase().trim();
    }

    if (category) {
      query.category = category;
    }

    const analyses = await Analysis.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json(analyses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get stats
const getStats = async (req, res) => {
  try {
    const analyses = await Analysis.find({
      userId: req.user.id,
    });

    const stats = {
      Positive: analyses.filter((item) => item.sentiment === "positive")
        .length,
      Negative: analyses.filter((item) => item.sentiment === "negative")
        .length,
      Neutral: analyses.filter((item) => item.sentiment === "neutral").length,
      total: analyses.length,
      categories: {},
    };

    analyses.forEach((item) => {
      const cat = item.category || "Other";
      stats.categories[cat] = (stats.categories[cat] || 0) + 1;
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Export CSV
const exportCsv = async (req, res) => {
  try {
    const analyses = await Analysis.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    const headers = [
      "Headline",
      "Category",
      "Sentiment",
      "Score",
      "Confidence",
      "Positive Keywords",
      "Negative Keywords",
      "Summary",
      "Source URL",
      "Source Type",
      "Created At",
    ];

    const rows = analyses.map((item) =>
      [
        `"${String(item.headline || "").replace(/"/g, '""')}"`,
        item.category || "",
        item.sentiment || "",
        item.score ?? "",
        item.confidence ?? "",
        `"${(item.positiveKeywords || []).join(" | ").replace(/"/g, '""')}"`,
        `"${(item.negativeKeywords || []).join(" | ").replace(/"/g, '""')}"`,
        `"${String(item.summary || "").replace(/"/g, '""')}"`,
        item.sourceUrl || "",
        item.sourceType || "",
        item.createdAt ? item.createdAt.toISOString() : "",
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="analysis-history.csv"'
    );

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Export PDF
const exportPdf = async (req, res) => {
  try {
    const analyses = await Analysis.find({
      userId: req.user.id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(20);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="analysis-report.pdf"'
    );

    const doc = new PDFDocument({
      margin: 40,
    });

    doc.pipe(res);

    doc
      .fontSize(20)
      .text("News Sentiment Checker Report", {
        underline: true,
      });

    doc.moveDown();

    if (!analyses.length) {
      doc.fontSize(12).text("No analysis records found.");
    }

    analyses.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item.headline}`);
      doc.text(`Sentiment: ${item.sentiment}`);
      doc.text(`Category: ${item.category}`);
      doc.text(`Score: ${item.score} | Confidence: ${item.confidence}`);
      doc.text(
        `Positive Keywords: ${
          (item.positiveKeywords || []).join(", ") || "None"
        }`
      );
      doc.text(
        `Negative Keywords: ${
          (item.negativeKeywords || []).join(", ") || "None"
        }`
      );
      doc.text(`Summary: ${item.summary || "No summary available"}`);
      doc.text(`Source URL: ${item.sourceUrl || "N/A"}`);
      doc.text(`Source Type: ${item.sourceType || "manual"}`);
      doc.text(`Date: ${new Date(item.createdAt).toLocaleString()}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete analysis
export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        message: "Analysis not found",
      });
    }

    if (!analysis.userId) {
      return res.status(400).json({
        message: "This analysis has no owner userId field in database",
      });
    }

    if (analysis.userId.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await analysis.deleteOne();

    res.json({
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createAnalysis,
  getMyAnalyses,
  getStats,
  exportCsv,
  exportPdf,
};