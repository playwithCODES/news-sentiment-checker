import express from "express";
import {
  createAnalysis,
  getMyAnalyses,
  getStats,
  exportCsv,
  exportPdf,
  deleteAnalysis
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAnalysis);
router.get("/", protect, getMyAnalyses);
router.get("/stats", protect, getStats);
router.get("/export/csv", protect, exportCsv);
router.get("/export/pdf", protect, exportPdf);
router.delete("/:id", protect, deleteAnalysis);

export default router;