import express from "express";
import {
  createAnalysis,
  getMyAnalyses,
  getStats,
  exportCsv,
  exportPdf
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAnalysis);
router.get("/", protect, getMyAnalyses);
router.get("/stats", protect, getStats);
router.get("/export/csv", protect, exportCsv);
router.get("/export/pdf", protect, exportPdf);

export default router;