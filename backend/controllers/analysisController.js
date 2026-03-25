import axios from "axios";
// import cheerio from "cheerio"
import * as cheerio from "cheerio";
import PDFDocument from "pdfkit";
import Analysis from "../models/Analysis.js";
import { analyzeNews } from "../utils/sentimentService.js";

async function extractArticleFromUrl(url) {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = cheerio.load(response.data);
  const title = $("title").first().text().trim() || "Untitled News";
  const paragraphs = [];

  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40) paragraphs.push(text);
  });

  return {
    headline: title,
    content: paragraphs.join(" ").slice(0, 5000)
  };
}

const createAnalysis = async (req, res) => {
  try {
    let { headline, content, sourceUrl } = req.body;
    let sourceType = "manual";

    if (sourceUrl && (!headline || !content)) {
      const scraped = await extractArticleFromUrl(sourceUrl);
      headline = headline || scraped.headline;
      content = content || scraped.content;
      sourceType = "url";
    }

    if (!headline || !content) {
      return res
        .status(400)
        .json({ message: "Headline and content are required" });
    }

    const result = analyzeNews(headline, content);

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
      sourceType
    });

    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message || "Analysis failed" });
  }
};

const getMyAnalyses = async (req, res) => {
  try {
    const { search = "", sentiment = "", category = "" } = req.query;

    const query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { headline: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (sentiment) query.sentiment = sentiment;
    if (category) query.category = category;

    const analyses = await Analysis.find(query).sort({ createdAt: -1 });
    res.status(200).json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id });

    const stats = {
      Positive: analyses.filter((item) => item.sentiment === "Positive").length,
      Negative: analyses.filter((item) => item.sentiment === "Negative").length,
      Neutral: analyses.filter((item) => item.sentiment === "Neutral").length,
      total: analyses.length,
      categories: {}
    };

    analyses.forEach((item) => {
      stats.categories[item.category] =
        (stats.categories[item.category] || 0) + 1;
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportCsv = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id }).sort({
      createdAt: -1
    });

    const headers = [
      "Headline",
      "Category",
      "Sentiment",
      "Score",
      "Confidence",
      "Source URL",
      "Created At"
    ];

    const rows = analyses.map((item) =>
      [
        `"${item.headline.replace(/"/g, '""')}"`,
        item.category,
        item.sentiment,
        item.score,
        item.confidence,
        item.sourceUrl,
        item.createdAt.toISOString()
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
    res.status(500).json({ message: error.message });
  }
};

const exportPdf = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="analysis-report.pdf"'
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).text("News Sentiment Checker Report", { underline: true });
    doc.moveDown();

    analyses.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item.headline}`);
      doc.text(`Sentiment: ${item.sentiment}`);
      doc.text(`Category: ${item.category}`);
      doc.text(`Score: ${item.score} | Confidence: ${item.confidence}%`);
      doc.text(`Date: ${new Date(item.createdAt).toLocaleString()}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createAnalysis,
  getMyAnalyses,
  getStats,
  exportCsv,
  exportPdf
};