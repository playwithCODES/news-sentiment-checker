import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: "Other",
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    confidence: {
      type: Number,
      required: true,
      default: 0.5,
    },
    positiveKeywords: {
      type: [String],
      default: [],
    },
    negativeKeywords: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "No summary available",
    },
    sourceType: {
      type: String,
      enum: ["manual", "url"],
      default: "manual",
    },
  },
  { timestamps: true }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;