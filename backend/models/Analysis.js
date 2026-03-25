import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    headline: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    sourceUrl: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      default: "General"
    },
    sentiment: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    positiveKeywords: {
      type: [String],
      default: []
    },
    negativeKeywords: {
      type: [String],
      default: []
    },
    sourceType: {
      type: String,
      enum: ["manual", "url"],
      default: "manual"
    }
  },
  { timestamps: true }
);

const model = mongoose.model("Analysis", analysisSchema);
export default model;


